using System;
using System.Linq.Expressions;
using MongoDB.Bson;
using MongoDB.Driver;

namespace CC.Net.Extensions
{
    public static class FilterDefinitionExtensions
    {
        public static FilterDefinition<TDocument> Match<TDocument>(this FilterDefinitionBuilder<TDocument> filter,
            string field, string value)
        {
            return filter.Regex(field, new BsonRegularExpression(value, "i"));
        }
    }

}
