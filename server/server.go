package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/kelseyhightower/envconfig"
)

type Config struct {
	Port              int           `default:"50051"`
	ConnectionTimeout time.Duration `split_words:"true" default:"1ms"`
	ServerCert        string        `split_words:"true" default:"./../cert/server-cert.pem"`
	ServerKey         string        `split_words:"true" default:"./../cert/server-key.pem"`
}

func mainErr() error {
	fmt.Println("Go http2 server")

	var config Config
	err := envconfig.Process("app", &config)
	if err != nil {
		return err
	}

	log.Printf("ConnectionTimeout: %v", config.ConnectionTimeout)
	addr := fmt.Sprintf(":%d", config.Port)

	server := &http.Server{
		Addr:        addr,
		ReadTimeout: config.ConnectionTimeout,
		ErrorLog:    log.New(io.Discard, "", 0),
	}

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte(fmt.Sprintf("Protocol: %s", r.Proto)))
	})

	log.Printf("listening on %s\n", addr)
	if err := server.ListenAndServeTLS(config.ServerCert, config.ServerKey); err != nil {
		return fmt.Errorf("Failed to serve on %s: %v", addr, err)
	}

	return nil
}

func main() {
	if err := mainErr(); err != nil {
		fmt.Fprintf(os.Stderr, "%v\n", err)
		os.Exit(-1)
	}
}
