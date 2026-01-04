package api

import (
	"database/sql"
	"fmt"
	"net/http"
	"strings"
)

type Type struct {
	Id          uint32 `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Unit        string `json:"unit"`
}

func (t *Type) new() object {
	return &Type{}
}

func (t *Type) scanRow(rows *sql.Rows) error {
	return rows.Scan(&t.Id, &t.Name, &t.Description, &t.Unit)
}

func (t *Type) getTable() string {
	return "types"
}

func (t *Type) getId() uint32 {
	return t.Id
}

func (t *Type) getAddQuery() (string, []any) {
	query := fmt.Sprintf("INSERT INTO %s (name, description, unit) VALUES (?, ?, ?)", t.getTable())
	args := []any{strings.ToLower(t.Name), t.Description, t.Unit}
	return query, args
}

type TypeHandler struct {
	db *sql.DB

	typ Type
}

func (t *TypeHandler) GetTags() []string {
	return []string{"DB"}
}

func (t *TypeHandler) SetDb(db *sql.DB) {
	t.db = db
}

func (t *TypeHandler) InitRoutes(mux *http.ServeMux, prefix string) error {
	fmt.Println("Initialising types")

	mux.HandleFunc(prefix+"/types/", t.getTypes)
	mux.HandleFunc(prefix+"/types/{Id}/", t.getTypeId)
	mux.HandleFunc(prefix+"/types/create/", t.createType)
	mux.HandleFunc(prefix+"/types/delete/", t.deleteType)

	return nil
}

func (t *TypeHandler) getTypes(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Getting types")

	sli, err := object_getAll(t.db, &t.typ)
	if err != nil {
		fmt.Println("Error getting types:", err)
		return
	}
	fmt.Println("got types:", sli)

	object_returnJson(w, sli)
}

func (t *TypeHandler) getTypeId(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("Id")
	fmt.Println(id)

	fmt.Println("Getting type by id")

	sli, err := object_getById(t.db, id, &Type{})
	if err != nil {
		fmt.Println("Error getting type:", err)
		return
	}
	object_returnJson(w, sli)
}

func (t *TypeHandler) createType(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Adding type")
	sli, err := object_decode(r.Body, &Type{})
	fmt.Println(sli)
	if err != nil {
		fmt.Println("Error decoding type:", err)
		return
	}

	err = object_create(t.db, sli)
	if err != nil {
		fmt.Println("Error adding type:", err)
		return
	}
}

func (t *TypeHandler) deleteType(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Deleting type")
	sli, err := object_decode(r.Body, &Type{})

	if err != nil {
		fmt.Println("Error decoding type:", err)
		return
	}

	err = object_delete(t.db, sli[0])
	if err != nil {
		fmt.Println("Error deleting type:", err)
		return
	}
}
