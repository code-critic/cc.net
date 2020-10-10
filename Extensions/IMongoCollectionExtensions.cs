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
            var filter = Builders<T>.Filter.Eq("id", document.Id);
            return collection.ReplaceOneAsync(filter, document);
        }
    }
}
