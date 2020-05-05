export default class LanguageExamples {
    public static examples = {
        'PY-367': `# python 3.5+ example
import sys
for line in sys.stdin:
    i = int(str(line).strip())
    if i == 42:
        break
    else:
        print(i)`,


        'PY-276': `# python 2.7 example
import sys
for line in sys.stdin:
    i = int(str(line).strip())
    if i == 42:
        break
    else:
        print i`,


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
public class MatrixReader {
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
    };
}