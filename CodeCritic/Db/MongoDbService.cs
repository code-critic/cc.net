using Cc.Net.Extensions;
using CC.Net.Collections;
using CC.Net.Config;
using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace CC.Net.Db
{
    public class MongoDbService : IDbService
    {
        private readonly MongoDBConfig _dBConfig;
        private readonly MongoClient _client;
        private readonly IMongoDatabase _dB;

        public readonly IMongoCollection<CcData> _data;
        public IDbCollection<CcData> Data { get; set; }

        public readonly IMongoCollection<CcEvent> _events;
        public IDbCollection<CcEvent> Events { get; set; }

        public readonly IMongoCollection<CcGroup> _groups;
        public IDbCollection<CcGroup> Groups { get; set; }

        public MongoDbService(MongoDBConfig dBConfig)
        {
            _dBConfig = dBConfig;
            _client = new MongoClient(new MongoClientSettings()
            {
                Server = MongoServerAddress.Parse(_dBConfig.Host),
                Credential = string.IsNullOrEmpty(_dBConfig.AuthMechanism)
                    ? null
                    : MongoCredential.CreateCredential(
                        _dBConfig.AuthSource,
                        _dBConfig.Username,
                        _dBConfig.Password
                    )
            });
            _dB = _client.GetDatabase(_dBConfig.Database);

            _data = _dB.GetCollection<CcData>(_dBConfig.CollectionData);
            _events = _dB.GetCollection<CcEvent>(_dBConfig.CollectionEvents);
            _groups = _dB.GetCollection<CcGroup>(_dBConfig.CollectionGroups);


            Data = new MongoCollection<CcData>(_data);
            Events = new MongoCollection<CcEvent>(_events);
            Groups = new MongoCollection<CcGroup>(_groups);
        }

        public class MongoCollection<T> : IDbCollection<T>  where T : IObjectId
        {
            private IMongoCollection<T> _db;

            public MongoCollection(IMongoCollection<T> data)
            {
                _db = data;
            }

            public void Add(T data)
            {
                _db.InsertOne(data);
            }

            public async Task<long> CountDocumentsAsync(Expression<Func<T, bool>> predicate = null)
            {
                if (predicate == null)
                {
                    return await _db.CountDocumentsAsync(i => true);
                }
                return await _db.CountDocumentsAsync(predicate);
            }

            public Task<T> SingleAsync(ObjectId objectId)
            {
                return _db.Find(i => i.Id == objectId).SingleAsync();
            }

            public Task<T> SingleOrDefaultAsync(ObjectId objectId)
            {
                return _db.Find(i => i.Id == objectId).SingleOrDefaultAsync();
            }

            public async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate = null)
            {
                if (predicate == null)
                {
                    return _db.AsQueryable();
                }

                return (await _db.FindAsync(predicate))
                    .ToList();
            }

            public async Task FindOneAndDeleteAsync(Expression<Func<T, bool>> predicate)
            {
                await _db.FindOneAndDeleteAsync(predicate);
            }

            public async Task<DbOperationResult> UpdateDocumentAsync(T document)
            {
                var result = await _db.UpdateDocumentAsync(document);
                return new DbOperationResult
                {
                    IsAcknowledged = result.IsAcknowledged,
                    ModifiedCount = (int)result.ModifiedCount,
                };
            }
        }
    }
}