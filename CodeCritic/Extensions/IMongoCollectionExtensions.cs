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
    public static class IMongoCollectionExtensions
    {
        public static Task<ReplaceOneResult> UpdateDocumentAsync<T>(this IMongoCollection<T> collection, T document)
            where T: IObjectId
        {
            return collection.ReplaceOneAsync(i => i.Id == document.Id, document);
        }
    }
}
