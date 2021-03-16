using System;
using System.Collections.Generic;
using System.Linq;

namespace cc.net.Exceptions
{
    public class DetailedException: Exception
    {
        public readonly List<string> Messages;

        public DetailedException(string message, params string[] messages): base(message)
        {
            Messages = messages.ToList()
                .Prepend(message)
                .ToList();
        }
    }
}