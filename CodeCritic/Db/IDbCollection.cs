using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;
using CC.Net.Collections;
using MongoDB.Bson;

namespace CC.Net.Db
{
    public interface IDbCollection<T> where T : IObjectId
    {
        Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate = null);
        Task<long> CountDocumentsAsync(Expression<Func<T, bool>> predicate = null);
        Task FindOneAndDeleteAsync(Expression<Func<T, bool>> predicate);

        void Add(T data);

        Task<T> SingleAsync(ObjectId objectId);
        Task<T> SingleOrDefaultAsync(ObjectId objectId);

        Task<DbOperationResult> UpdateDocumentAsync(T document);
    }
}