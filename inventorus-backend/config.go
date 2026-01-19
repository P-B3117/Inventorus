package main

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"

	"github.com/ilyakaznacheev/cleanenv"
)

const (
	TAG = "Config-Manager:"
)

type Config struct {
	Port   string `yaml:"Port" env:"PORT" env-default:"8080"`
	DbPath string `yaml:"DbPath" env:"DB_PATH" env-default:"not-defined"`
}

func (cfg *Config) Init() error {
	ex, err := os.Executable()
	if err != nil {
		fmt.Println("Error getting executable path:", err)
		return err
	}
	exPath := filepath.Dir(ex)
	cfgPath := filepath.Join(exPath, "inventorus.yml")

	if _, err := os.Stat(cfgPath); errors.Is(err, os.ErrNotExist) {
		fmt.Println("Config file not found, using environment variables")
		err = cleanenv.ReadEnv(cfg)
		if err != nil {
			return fmt.Errorf("Config error: %v", err)
		}
	} else {
		err := cleanenv.ReadConfig(cfgPath, cfg)
		if err != nil {
			return fmt.Errorf("Config error: %v", err)
		}
	}
	if cfg.DbPath == "not-defined" {
		cfg.DbPath = filepath.Join(exPath, "inventorus_db.sqlite")
	}

	return nil
}
