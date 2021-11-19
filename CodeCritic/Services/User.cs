using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;

namespace CC.Net.Entities
{
    public class User: IComparable<User>
    {
        public string id { get; set; }
        public List<string> Tags { get; set; } = new List<string>();

        public int CompareTo([AllowNull] User other)
        {
            return id.CompareTo(other.id);
        }


        // implement comparable methods
        public override bool Equals(object obj)
        {
            return obj is User user
                ? user.id == id
                : false;
        }

        // compute hash code
        public override int GetHashCode()
        {
            return id.GetHashCode();
        }
    }
}