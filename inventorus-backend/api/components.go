package api

import (
	"database/sql"
	"errors"
	"fmt"
	"net/http"
	"strconv"
)

type Component struct {
	Id                 uint32 `json:"id"`
	Type_id            uint32 `json:"type_id"`
	Value              string `json:"value"`
	Quantity           uint32 `json:"quantity"`
	Footprint          string `json:"footprint"`
	Vendor_id          uint32 `json:"vendor_id"`
	Description        string `json:"description"`
	Vendor_part_number string `json:"vendor_part_number"`
	Price              uint16 `json:"price"`
}

func (c *Component) new() object {
	return &Component{}
}

func (c *Component) scanRow(rows *sql.Rows) error {
	return rows.Scan(&c.Id, &c.Type_id, &c.Value, &c.Quantity, &c.Footprint, &c.Vendor_id, &c.Description, &c.Vendor_part_number, &c.Price)
}

func (c *Component) getTable() string {
	return "components"
}

func (c *Component) getId() uint32 {
	return c.Id
}

func (c *Component) fromCsv(row []string) error {
	if len(row) != 8 {
		return errors.New("invalid csv length")
	}
	c.Type_id, _ = strconv.Atoi(csv[0])
	c.Value = csv[1]
	c.Quantity, _ = strconv.Atoi(csv[2])
	c.Footprint = csv[3]
	c.Vendor_id, _ = strconv.Atoi(csv[4])
	c.Description = csv[5]
	c.Vendor_part_number = csv[6]
	c.Price, _ = strconv.Atoi(csv[7])
	return nil
}

func (c *Component) getAddQuery() (string, []any) {
	query := fmt.Sprintf("INSERT INTO %s (Type_id, Value, Quantity, Footprint, Vendor_id, Description, Vendor_part_number, Price) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", c.getTable())
	args := []any{c.Type_id, c.Value, c.Quantity, c.Footprint, c.Vendor_id, c.Description, c.Vendor_part_number, c.Price}
	return query, args
}

type ComponentHandler struct {
	db *sql.DB

	component Component
}

func (c *ComponentHandler) GetTags() []string {
	return []string{"DB"}
}

func (v *ComponentHandler) SetDb(db *sql.DB) {
	v.db = db
}

func (c *ComponentHandler) InitRoutes(mux *http.ServeMux, prefix string) error {

	mux.HandleFunc(prefix+"/components/", c.getComponents)
	mux.HandleFunc(prefix+"/components/{Id}/", c.getComponentId)
	mux.HandleFunc(prefix+"/components/add/", c.addComponent)
	mux.HandleFunc(prefix+"/components/create/", c.createComponent)
	mux.HandleFunc(prefix+"/components/delete/", c.deleteComponent)

	return nil
}

func (c *ComponentHandler) getComponents(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Getting components")

	sli, err := object_getAll(c.db, &Component{})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	object_returnJson(w, sli)
}

func (c *ComponentHandler) getComponentId(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Getting component")

	id := r.PathValue("Id")

	sli, err := object_getById(c.db, id, &Component{})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	object_returnJson(w, sli)
}

func (c *ComponentHandler) addComponent(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Adding component")

	sli, err := object_decode(r.Body, &Component{})
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	query := `UPDATE ?
        SET quantity = quantity + ?
        WHERE id = ?`

	cpn := sli[0].(*Component)

	_, err = c.db.Exec(query, cpn.Quantity, cpn.Id)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (c *ComponentHandler) createComponent(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Creating component")

	sli, err := object_decode(r.Body, &Component{})
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err = object_create(c.db, sli)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (c *ComponentHandler) deleteComponent(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Deleting component")

	sli, err := object_decode(r.Body, &Component{})
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err = object_delete(c.db, sli[0])
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
