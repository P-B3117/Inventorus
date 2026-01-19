package dtb

import (
	"database/sql"
	_ "embed"
	"fmt"
	"strings"

	_ "github.com/tursodatabase/go-libsql"
)

//go:embed sql/init.sql
var initDbQuery string

//go:embed sql/test_values.sql
var testValues string

var db *sql.DB

func initDb(db *sql.DB) {
	fmt.Println("Starting db")
	for stmt := range strings.SplitSeq(initDbQuery, ";") {
		if stmt != "" {
			db.Exec(stmt)
		}
	}
}

func insertTestValuesDb(db *sql.DB) {
	fmt.Println("Starting db")
	for stmt := range strings.SplitSeq(testValues, ";") {
		if stmt != "" {
			db.Exec(stmt)
		}
	}
}

func StartDb(ch chan (*sql.DB), path string) {
	db, err := sql.Open("libsql", fmt.Sprintf("file:%s", path))
	defer func() { ch <- db }() // ensure the db is passed after all is done

	if err != nil {
		fmt.Println("Error opening database:", err)
		return
	}

	initDb(db)
}

func StopDb() {
	db.Close()
}
