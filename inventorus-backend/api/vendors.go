package api

import (
	"database/sql"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"
)

type Vendor struct {
	Id          uint32 `json:"id"`
	Url         string `json:"url"`
	Description string `json:"description"`
	Name        string `json:"name"`
}

func (v *Vendor) new() object {
	return &Vendor{}
}

func (v *Vendor) scanRow(rows *sql.Rows) error {
	return rows.Scan(&v.Id, &v.Url, &v.Description, &v.Name)
}

func (v *Vendor) getTable() string {
	return "vendors"
}

func (v *Vendor) getId() uint32 {
	return v.Id
}

func (v *Vendor) getAddQuery() (string, []any) {
	query := fmt.Sprintf("INSERT INTO %s (url, description, name) VALUES (?, ?, ?)", v.getTable())
	args := []any{v.Url, v.Description, strings.ToLower(v.Name)}
	return query, args
}

func (v *Vendor) fromCsv(row []string) error {
	if len(row) != 4 {
		return errors.New("invalid csv length")
	}

	// because go somehow ain't got string to uint32 conversion
	var temp uint64
	temp, _ = strconv.ParseUint(row[0], 10, 32)
	v.Id = uint32(temp)
	v.Url = row[1]
	v.Description = row[2]
	v.Name = row[3]

	return nil
}

type VendorHandler struct {
	db *sql.DB

	vendor Vendor
}

func (v *VendorHandler) GetTags() []string {
	return []string{"DB"}
}

func (v *VendorHandler) SetDb(db *sql.DB) {
	v.db = db
}

func (v *VendorHandler) InitRoutes(mux *http.ServeMux, prefix string) error {

	mux.HandleFunc(prefix+"/vendors/", v.getVendor)
	mux.HandleFunc(prefix+"/vendors/{Id}/", v.getVendorId)
	mux.HandleFunc(prefix+"/vendors/create/", v.createVendor)
	mux.HandleFunc(prefix+"/vendors/delete/", v.deleteVendor)

	return nil
}

func (v *VendorHandler) getVendor(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Getting all vendors")

	vendors, err := object_getAll(v.db, &Vendor{})

	if err != nil {
		fmt.Println("Got this error while getting vendors:\n  ", err)
		return
	}

	object_returnJson(w, vendors)
}

func (v *VendorHandler) getVendorId(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Getting vendor by id")

	Id := r.PathValue("Id")
	fmt.Println(Id)

	vendors, err := object_getById(v.db, Id, &Vendor{})

	if err != nil {
		fmt.Println("Got this error while scanning vendor:\n  ", err)
		return
	}

	object_returnJson(w, vendors)
}

func (v *VendorHandler) createVendor(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Adding vendor")

	sli, err := object_decode(r.Body, &v.vendor)
	if err != nil {
		fmt.Println("Got this error while decoding vendor:\n  ", err)
		return
	}

	err = object_create(v.db, sli)
	if err != nil {
		fmt.Println("Got this error while adding vendor:\n  ", err)
		return
	}
}

func (v *VendorHandler) deleteVendor(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Deleting vendor")

	sli, err := object_decode(r.Body, &v.vendor)
	if err != nil {
		fmt.Println("Got this error while decoding vendor:\n  ", err)
		return
	}

	err = object_delete(v.db, sli[0])
	if err != nil {
		fmt.Println("Got this error while deleting vendor:\n  ", err)
		return
	}
}
