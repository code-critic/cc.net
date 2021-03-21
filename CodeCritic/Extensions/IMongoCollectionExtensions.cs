using cc.net.Collections;
using CC.Net.Collections;
using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace cc.net.Extensions
{
    public static class MongoCollectionExtensions
    {
        public static Task<ReplaceOneResult> UpdateDocumentAsync<T>(this IMongoCollection<T> collection, T document)
            where T: IObjectId
        {
            return collection.ReplaceOneAsync(i => i.Id == document.Id, document);
        }
        
        public static async Task<long> MarkAsReadAsync(this IMongoCollection<CcEvent> collection, IEnumerable<CcEvent> documents)
        {
            var i = 0L;
            foreach (var document in documents.Where(j => j.IsNew))
            {
                document.IsNew = false;
                await collection.UpdateDocumentAsync(document);
                i++;
            }

            return i;
        }
        
        public static async Task<long> MarkAsReadAsync(this IMongoCollection<CcEvent> collection, IAsyncCursor<CcEvent> documents)
        {
            return await collection.MarkAsReadAsync(await documents.ToListAsync());
        }
    }
}
