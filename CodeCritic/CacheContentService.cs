using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace cc.net
{
    public class CacheContentService
    {

        private Dictionary<string, CacheEntry> _cache = new Dictionary<string, CacheEntry>();
        private DateTime _lastService = DateTime.Now;

        public CacheEntry GetCache(string cacheKey)
        {
            if (DateTime.Now - _lastService > TimeSpan.FromMinutes(10))
            {
                CleanCache();
            }
            return _cache.TryGetValue(cacheKey, out CacheEntry entry) && entry.IsValid
                ? entry : null;
        }

        private void CleanCache()
        {
            _cache = _cache
                .Where(i => i.Key != null && i.Value != null && i.Value.IsValid)
                .ToDictionary(i => i.Key, i => i.Value);
                
            _lastService = DateTime.Now;
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
