import { IUnittestSpec } from '../cc-api';

export default class LanguageExamples {
    public static examples = {
        'PYTHON': `# python 3.5+ example
import sys
for line in sys.stdin:
    i = int(str(line).strip())
    if i == 42:
        break
    else:
        print(i)`,


        'CPP': `// C++ example
#include <iostream> 
using namespace std; 
  
int main() 
{ 
  
    // Declare the variables 
    int num; 
  
    // Input the integer 
    cout << "Enter the integer: "; 
    cin >> num; 
  
    // Display the integer 
    cout << "Entered integer is: " << num; 
  
    return 0; 
}`,


        'JAVA': `// JAVA example
import java.util.Scanner;
public class main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        while (input.hasNext()) {
            System.out.print(input.nextLine());
        }
    }
}`,


        'CS': `// C# example
using System;
 
namespace Sample
{
    class Test
    {
        public static void Main(string[] args)
        {
            string testString;
            Console.Write("Enter a string - ");
            testString = Console.ReadLine();
            Console.WriteLine("You entered '{0}'", testString);
        }
    }
}`,
        'DOTNET': `// C# example
using System;
 
namespace Sample
{
    class Test
    {
        public static void Main(string[] args)
        {
            string testString;
            Console.Write("Enter a string - ");
            testString = Console.ReadLine();
            Console.WriteLine("You entered '{0}'", testString);
        }
    }
}`,


        'C': `// C example
#include <stdio.h>   
int main(void)
{
  int i;
  char name[BUFSIZ];
  
  printf ("Input a number: ");
  scanf("%d", &i);
  
  printf("Enter your name: ");
  fgets(name, BUFSIZ, stdin);
  
  printf ("Hello %s, your number was %d", name, i);
  
  return(0);
}`,

        'MATLAB': `% Matlab code
A = ones(10);
B = zeros(10);
C = eye(10);

%% test
e = 1.0;
[a2, b2, c2] = kvadracoef(x, y);
 
 
%% plot
ff = figure;
p = [a2, b2, c2];
f = polyval(p,x);
plot(x,y,'o',x,f,'-');
legend('data','linear fit');
saveas(ff, 'figure.png');
`,
        'MARKDOWN': `# Big title

> quote

\`some code\`
        `,

        'NODEJS': `
// NodeJS example
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', function(line){
    for (let i = 0; i < +line; i++) console.log('Hello world!')
})`,

        'TS': `
// Typescript example
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', function(line){
    for (let i = 0; i < +line; i++) console.log('Hello world!')
})`
    }


    public static templatesMain = {
        'PYTHON': `
import sys
for line in sys.stdin:
    # do something`,


        'JAVA': `
import java.util.Scanner;
public class main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        // do something
    }
}`,

        'CPP': `
#include <iostream> 
int main() { 
    // do something
    int num; 
    std::cin >> num; 
    return 0; 
}`,

        'C': `
#include <stdio.h> 
int main() { 
    // do something
    int num; 
    scanf("%d", &num);
    return 0; 
}`,

        'CS': `
using System;
namespace Solution
{
    public class main
    {
        public static void Main(string[] args)
        {
            // do something
            var num = int.Parse(Console.ReadLine());
        }
    }
}`,

        'DOTNET': `
using System;
namespace Solution
{
    public class main
    {
        public static void Main(string[] args)
        {
            // do something
            var num = int.Parse(Console.ReadLine());
        }
    }
}`,

        'NODEJS': `
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', line => {
    // do something
})`,


        'TS': `
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

rl.on('line', (line: string) => {
    // do something
})`,


        'MATLAB': `
% your code here
        `
    }

    public static templatesLibname = {

        'PYTHON': (unittestSpec: IUnittestSpec) => {
            const { libname, methods } = unittestSpec;
            return `
# solution for ${libname}

${(methods.map(method => `${method}:
    # do something`)).join('\n\n')}`.trim();
        },

        'JAVA': (unittestSpec: IUnittestSpec) => {
            const { libname, methods } = unittestSpec;
            const withoutExtension = libname.split('.', 1)[0];
            return `
// solution for ${libname}

public class ${withoutExtension} {
    ${(methods.map(method => `${method} {
        // do something
    }`)).join('\n\n')}
}
`.trim();},
    }
};

