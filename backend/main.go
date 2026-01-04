package main

import (
	"c3i/api"
	"c3i/dtb"
	"database/sql"
	"embed"
	"fmt"
	"io"
	"io/fs"
	"net/http"
	"strings"
	"sync"
	"time"
)

type target struct {
	tag  string
	init api.Handler
}

type homeHandler struct {
	_targets []target
	db       *sql.DB
	mux      *http.ServeMux
	Fser     http.Handler
	Fsys     fs.FS
}

// This directive tells Go to embed the "frontend" folder into this variable
//
//go:embed frontend/*
var frontendBuild embed.FS

func (h *homeHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// Remove trailing slashes to prevent redirect issues with static files
	path := strings.TrimSuffix(r.URL.Path, "/")
	if path == "" {
		path = "/"
	}
	r.URL.Path = path

	_, err := h.Fsys.Open(strings.TrimPrefix(r.URL.Path, "/"))
	if err != nil {
		// 3. If file doesn't exist (e.g. /dashboard), serve index.html
		// This allows React Router to handle the URL
		index, _ := h.Fsys.Open("index.html")
		http.ServeContent(w, r, "index.html", time.Now(), index.(io.ReadSeeker))
		return
	}

	// 4. Otherwise, serve the static file (js, css, etc.)
	h.Fser.ServeHTTP(w, r)
}

func (h *homeHandler) _initTarget(tar target) {
	fmt.Println("Adding routes for ", tar.tag)
	_ = tar.init.InitRoutes(h.mux, "/api")
	tags := tar.init.GetTags()
	for _, tag := range tags {
		switch tag {
		case "DB":
			fmt.Println("Setting Db for ", tar.tag)
			tar.init.SetDb(h.db)
		default:
			fmt.Println("Got an invalid tag from ", tar.tag)
		}
	}
}

// takes the first argument in the path and returns the target that match
func (h *homeHandler) InitializeTargets() error {
	var wg sync.WaitGroup

	for _, tar := range h._targets {
		// run every targets initialisation in parralel
		wg.Go(func() {
			h._initTarget(tar)
		})
	}

	wg.Wait()

	return nil
}

func main() {
	fmt.Println("Starting api")
	chDtb := make(chan *sql.DB, 1)

	go dtb.StartDb(chDtb)
	defer func() {
		fmt.Println("Stopping db")
		dtb.StopDb()
	}()
	// http multiplexer
	mux := http.NewServeMux()

	dist, _ := fs.Sub(frontendBuild, "frontend")
	fileServer := http.FileServer(http.FS(dist))

	handler := &homeHandler{
		_targets: []target{
			{tag: "vendors", init: &api.VendorHandler{}}, // just create functions that takes the homehandler mux and that calls the handleFunc on each path. create an interface for that?
			{tag: "types", init: &api.TypeHandler{}},
			{tag: "components", init: &api.ComponentHandler{}},
		},
		mux:  mux,
		Fsys: dist,
		Fser: fileServer,
	}

	// TODO make a add function to homehandler so if we add the vendors struct, it adds it to the paths slice
	// Register the routes and handlers
	mux.HandleFunc("/", handler.ServeHTTP)

	db := <-chDtb
	handler.db = db

	fmt.Println("\nInitializing targets\n")
	handler.InitializeTargets()
	fmt.Println("\nFINISHED Initializing targets\n")

	// Run the server
	fmt.Println("Starting to listen")
	err := http.ListenAndServe(":8080", mux)

	fmt.Print("Listen and serve ended with:\n  ", err)

	fmt.Println("Ending api")
}
