using System.Collections.Generic;

namespace CC.Net.Extensions
{
    public static class DictionaryExtensions {

        public static U GetValueByKeyOrNull<T, U>(this Dictionary<T, U> dict, T key)
        where U : class //it's acceptable for me to have this constraint
        {
            if (dict.ContainsKey(key))
                return dict[key];
            else
                //it could be default(U) to use without U class constraint
                //however, I didn't need this.
                return null;
        }
    }
}