using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace cc.net
{
    public class CacheContentService
    {

        private Dictionary<string, CacheEntry> _cache = new Dictionary<string, CacheEntry>();
        private DateTime lastService = DateTime.Now;

        public CacheEntry GetCache(string cacheKey)
        {
            if (DateTime.Now - lastService > TimeSpan.FromMinutes(10))
            {
                CleanCache();
            }
            return _cache.TryGetValue(cacheKey, out CacheEntry entry) && entry.IsValid
                ? entry : null;
        }

        private void CleanCache()
        {
            foreach (var key in _cache.Where(i => !i.Value?.IsValid ?? true).Select(i => i.Key).ToList())
            {
                _cache.Remove(key);
            }
            lastService = DateTime.Now;
        }

        public void SaveCache(string cacheKey, object result, TimeSpan timeToLive)
        {
            _cache[cacheKey] = new CacheEntry
            {
                Result = result,
                ValidUntil = DateTime.Now.Add(timeToLive)
            };
        }


        public class CacheEntry
        {
            public object Result { get; set; }
            public DateTime ValidUntil { get; set; }

            public bool IsValid => DateTime.Now < ValidUntil;
        }
    }

}
