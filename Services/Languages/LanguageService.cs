

using System.Collections.Generic;
using System.Linq;
using CC.Net.Config;
using CC.Net.Utils;

namespace CC.Net.Services.Languages
{
    public class LanguageService
    {
        private readonly AppOptions _appOptions;

        private List<Language> _languages;
        public List<Language> Languages {
            get 
            {
                _languages ??= Parse();
                return _languages;
            }
        }

        public LanguageService(AppOptions appOptions)
        {
            _appOptions = appOptions;
        }

        private List<Language> Parse()
        {
            var file = $"{_appOptions.ConfigDir}/langs.yaml";
            return YamlRead.ReadFromFile<List<Language>>(file);
        }

        public Language this[string key]
        {
            get => Languages.First(i => i.Id.ToLower() == key.ToLower());
        }
    }
}