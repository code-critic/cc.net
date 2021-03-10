using System.Collections;
using System.Collections.Generic;
using System.Linq;
using CC.Net.Collections;

namespace CC.Net.Services
{
    public static class StatusResolver
    {
        public static CcDataResult DetermineResult(IEnumerable<CcDataCaseResult> items)
        {
            var results = items
                .OrderByDescending(i => i.Status)
                .ToList();

            var statuses = results
                .Select(i => ProcessStatus.Get(i.Status))
                .ToList();

            var worstStatus = statuses.First();
            var worstResult = results.First();

            return worstResult;
        }
    }
}