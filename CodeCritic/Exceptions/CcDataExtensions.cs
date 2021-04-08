using System.Linq;
using CC.Net.Collections;
using CC.Net.Services;

namespace Cc.Net.Exceptions
{
    public static class CcDataExtensions
    {
        public static CcData IncludeDirectories(this CcData item, UtilService utilService)
        {
            return utilService.IncludeDirectories(item);
        }

        public static CcData HideHiddenFiles(this CcData item, bool isRoot)
        {
            item.Solutions = item.Solutions
                .Where(i => isRoot || !i.Hidden)
                .ToList();
            
            return item;
        } 
    }
}