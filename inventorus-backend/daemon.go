package main

import (
	"fmt"
	"os"
	"path/filepath"
)

const (
	DTAG               = "Daemon-Manager:"
	daemonFilePath     = "/etc/systemd/system/inventorus.service"
	daemonFileTemplate = `
[Unit]
Description=Inventorus web service
Wants=network.target
After=network.target

[Service]
Type=simple
Restart=always
RestartSec=5
WorkingDirectory=%s
ExecStart=%s

[Install]
WantedBy=multi-user.target
`
	DaemonInitMessage = `Daemon created
	The daemon is created based on this executable location, if you move it, you need to update the daemon file
	To start it: sudo systemctl start inventorus
	To enable it (start on boot): sudo systemctl enable inventorus
	To disable it (stop on boot): sudo systemctl disable inventorus
	To stop it: sudo systemctl stop inventorus
	To restart it: sudo systemctl restart inventorus
	To check status: sudo systemctl status inventorus
	To view logs: sudo journalctl -u inventorus.service`
)

func daemonize() error {
	fmt.Println(TAG, "Daemonizing")

	ex, err := os.Executable()
	if err != nil {
		fmt.Println(TAG, "Error getting executable path:", err)
		return err
	}
	exPath := filepath.Dir(ex)

	daemonFile := fmt.Sprintf(daemonFileTemplate, exPath, ex)

	err = os.WriteFile(daemonFilePath, []byte(daemonFile), 0644)
	if err != nil {
		fmt.Println(TAG, "Error writing daemon file:", err)
		return err
	}

	fmt.Println(TAG, DaemonInitMessage)
	fmt.Println()

	return nil
}
