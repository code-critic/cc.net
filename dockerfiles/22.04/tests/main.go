// This simple program takes a positive natural number n from the standard input stream and writes string Hello world!, n times


package main

import "fmt"

func main() {
	var n int
	fmt.Scan(&n)
	for i := 0; i < n; i++ {
		fmt.Println("Hello world!")
	}
}