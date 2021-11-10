using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using MongoDB.Bson;
using CC.Net.Collections;

namespace CC.Net.Db
{
    public class InMemoryCollection<T>: IDbCollection<T>  where T : IObjectId {
        private List<T> _db { get; set; } = new List<T>();

        public void Add(T data)
        {
            _db.Add(data);
        }

        public Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate = null)
        {
            if (predicate == null)
            {
                return Task.FromResult(_db.AsEnumerable());
            }

            var compiled = predicate.Compile();
            var data = _db.Where(i => compiled(i));
            return Task.FromResult(data);
        }

        public Task<T> SingleAsync(ObjectId objectId)
        {
            var data = _db.Single(i => i.Id == objectId);
            return Task.FromResult(data);
        }

        public Task<DbOperationResult> UpdateDocumentAsync(T document)
        {
            return Task.FromResult(
                new DbOperationResult {
                    IsAcknowledged = true,
                }
            );
        }

        public async Task<long> CountDocumentsAsync(Expression<Func<T, bool>> predicate = null)
        {
            if (predicate == null)
            {
                return _db.Count;
            }
            var compiled = predicate.Compile();
            return _db.Count(compiled);
        }

        public async Task FindOneAndDeleteAsync(Expression<Func<T, bool>> predicate)
        {
            var compiled = predicate.Compile();
            _db = _db
                .Where(i => !compiled(i))
                .ToList();
        }

        public Task<T> SingleOrDefaultAsync(ObjectId objectId)
        {
            var data = _db.SingleOrDefault(i => i.Id == objectId);
            return Task.FromResult(data);
        }
    }
}