!/bin/bash

function test_languages() {
    # main.c
    gcc main.c -o c.out > /dev/null 2>&1
    ./c.out > /dev/null 2>&1
    echo "C: $?"

    # main.cc
    g++ main.cc -o cpp.out > /dev/null 2>&1
    ./cpp.out > /dev/null 2>&1
    echo "C++: $?"

    # main2.cs using mono
    mcs main2.cs > /dev/null 2>&1
    mono main2.exe > /dev/null 2>&1
    echo "C#: $?"

    # main.cs using dotnet 7
    dotnet run main.cs > /dev/null 2>&1
    echo "C# (dotnet): $?"

    # main.java
    javac main.java > /dev/null 2>&1
    java main > /dev/null 2>&1
    echo "Java: $?"

    # main.py
    python3 main.py > /dev/null 2>&1
    echo "Python: $?"

    # main.rb
    ruby main.rb > /dev/null 2>&1
    echo "Ruby: $?"

    # main.rs
    rustc main.rs -o rust.out > /dev/null 2>&1
    ./rust.out > /dev/null 2>&1
    echo "Rust: $?"

    # main.ts
    tsc main.ts > /dev/null 2>&1
    node main.js > /dev/null 2>&1
    echo "TypeScript: $?"
}

function print_version() {
    echo "gcc: $(gcc --version | head -n 1)"
    echo "g++: $(g++ --version | head -n 1)"
    echo "mono: $(mono --version | head -n 1)"
    echo "dotnet: $(dotnet --version)"
    echo "java: $(java -version 2>&1 | head -n 1)"
    echo "python: $(python3 --version)"
    echo "ruby: $(ruby --version)"
    echo "rustc: $(rustc --version)"
    echo "tsc: $(tsc --version)"
}


function test_languages_using_execute() {
    # execute same commands but with python execute command, default timeout is 5 seconds
    execute ---t 5 ---e error.txt gcc main.c -o c.out
    execute ---t 5 ---e error.txt ./c.out
    echo "C: $?"

    execute ---t 5 ---e error.txt g++ main.cc -o cpp.out
    execute ---t 5 ---e error.txt ./cpp.out
    echo "C++: $?"


    execute ---t 5 ---e error.txt mcs main2.cs
    execute ---t 5 ---e error.txt mono main2.exe
    echo "C#: $?"

    execute ---t 5 ---e error.txt dotnet run main.cs
    echo "C# (dotnet): $?"

    execute ---t 5 ---e error.txt ---e error.txt javac main.java
    execute ---t 5 ---e error.txt java main
    echo "Java: $?"

    execute ---t 5 ---e error.txt python3 main.py
    echo "Python: $?"

    execute ---t 5 ---e error.txt ruby main.rb
    echo "Ruby: $?"
}

print_version
echo "----------------------------------------"
test_languages
echo "----------------------------------------"
test_languages_using_execute