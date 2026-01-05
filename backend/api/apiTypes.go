package api

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
)

type Handler interface {
	InitRoutes(mux *http.ServeMux, prefix string) error
	SetDb(db *sql.DB)
	// get tags to say what to init.
	// InitRoutes is always called
	// "DB" = setDb is called
	//
	GetTags() []string
}

// Always use pointer methods
type object interface {
	new() object
	getTable() string
	getId() uint32
	getAddQuery() (string, []any)
	scanRow(rows *sql.Rows) error
}

func object_getById(db *sql.DB, id string, obj object) ([]object, error) {
	query := fmt.Sprintf("SELECT * FROM %s WHERE id = ?", obj.getTable())
	fmt.Println("Querying with:\n  " + query)
	rows, err := db.Query(query, id)
	if err != nil {
		fmt.Println("Got this error while getting object:\n  ", err)
		return []object{}, err
	}
	defer rows.Close()
	rows.Next()
	err = obj.scanRow(rows)
	if err != nil {
		fmt.Println("Got this error while scanning object:\n  ", err)
		return []object{}, err
	}
	return []object{obj}, nil
}

func object_getAll(db *sql.DB, obj object) ([]object, error) {
	query := fmt.Sprintf("SELECT * FROM %s", obj.getTable())
	fmt.Println("Querying with:\n  " + query)
	rows, err := db.Query(query)
	if err != nil {
		fmt.Println("Got this error while getting objects:\n  ", err)
		return []object{}, err
	}

	defer rows.Close()

	var objects []object

	for rows.Next() {
		tmpObj := obj.new()
		err = tmpObj.scanRow(rows)
		if err != nil {
			fmt.Println("Got this error while scanning objects:\n  ", err)
			return []object{}, err
		}
		objects = append(objects, tmpObj)
	}

	// Check for errors from iterating over rows.
	if err = rows.Err(); err != nil {
		fmt.Println("Got the following error iterating over rows:")
		log.Fatal(err)
	}

	fmt.Println("Got the following objects:")
	for _, obj := range objects {
		fmt.Println("  ", obj)
	}

	return objects, nil
}

// TODO refactor that to enable batching? or change api to use path variable
func object_delete(db *sql.DB, obj object) error {
	query := fmt.Sprintf("DELETE FROM %s WHERE id = ?", obj.getTable())
	fmt.Println("Querying with:\n  " + query)
	_, err := db.Exec(query, obj.getId())
	if err != nil {
		fmt.Println("Got this error while deleting object:\n  ", err)
		return err
	}
	return nil
}

// not thread safe on the same object
func object_decode(body io.ReadCloser, obj object) ([]object, error) {
	fmt.Println("Decoding ", body)

	decoder := json.NewDecoder(body)

	var objs []object

	for decoder.More() {
		tmpObj := obj.new()
		err := decoder.Decode(tmpObj)
		if err != nil {
			return []object{}, err
		}
		objs = append(objs, tmpObj)
	}

	return objs, nil
}

// TODO support batching to optimize bulk inserts. Also maybe have single insert detection
func object_create(db *sql.DB, objs []object) error {
	fmt.Println("Creating objects")
	ctx := context.Background()

	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	fmt.Println("Entering creation loop")
	for _, obj := range objs {
		query, args := obj.getAddQuery()
		fmt.Println("Querying with:\n  " + query)
		ans, err := tx.ExecContext(ctx, query, args...)
		if err != nil {
			fmt.Println("Got this error while adding object:\n  ", err)
			return err
		}
		fmt.Println("Got this answer while adding object:\n  ", ans)
	}

	return tx.Commit()
}

func object_returnJson(w http.ResponseWriter, o []object) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(o)
}
