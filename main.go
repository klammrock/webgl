package main

import (
	"fmt"
	"net/http"
)

func main() {
	fmt.Println("starting")

	http.Handle("/", http.StripPrefix("/", http.FileServer(http.Dir("./web/"))))
	http.ListenAndServe(fmt.Sprintf(":%d", 9977), nil)
}
