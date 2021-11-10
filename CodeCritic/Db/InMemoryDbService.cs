using CC.Net.Collections;

namespace CC.Net.Db
{
    public class InMemoryDbService: IDbService
    {
        public IDbCollection<CcData> Data {get; set;} = new InMemoryCollection<CcData>();
        public IDbCollection<CcEvent> Events {get; set;} = new InMemoryCollection<CcEvent>();
        public IDbCollection<CcGroup> Groups {get; set;} = new InMemoryCollection<CcGroup>();
    }
}