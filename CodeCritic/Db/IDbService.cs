using System;
using CC.Net.Collections;
using OneOf;

namespace CC.Net.Db
{
    public interface IDbService
    {
        IDbCollection<CcData> Data { get; set; }
        IDbCollection<CcEvent> Events { get; set; }
        IDbCollection<CcGroup> Groups { get; set; }
    }

    public static class IDbServiceExtensions {
        public static OneOf<MongoDbService, InMemoryDbService> Resolve(this IDbService service)
        {
            if (service is MongoDbService mongoDb)
            {
                return mongoDb;
            }
            else if (service is InMemoryDbService inMemoryDb)
            {
                return inMemoryDb;
            }
            
            throw new NotImplementedException();
        }
    }
}