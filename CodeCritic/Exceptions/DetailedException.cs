using System;
using System.Collections.Generic;
using System.Linq;

namespace Cc.Net.Exceptions
{
    public class DetailedException: Exception
    {
        public readonly List<string> Messages;

        public readonly string File;

        public DetailedException(string message, string file, params string[] messages): base(message)
        {
            File = file;
            Messages = messages.ToList()
                .Prepend(message)
                .ToList();
        }
    }
}