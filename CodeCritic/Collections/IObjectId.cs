using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace cc.net.Collections
{
    public interface IObjectId
    {
        ObjectId Id { get; set; }
    }
}
