using System.Collections.Generic;

namespace CC.Net.Entities
{
    public class User
    {
        public string id { get; set; }
        public List<string> Tags { get; set; } = new List<string>();
    }
}