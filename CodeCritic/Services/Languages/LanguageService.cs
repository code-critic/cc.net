
using System;
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
            var (data, _) = YamlRead.ReadFromFile<List<Language>>(file);
            return data;
        }

        // public Language this[string key] => Languages.First(i => i.Id.ToLower() == key.ToLower());

        public Language this[string key]
        {
            get
            {
                try
                {
                    return Languages.First(i => i.Id.ToLower() == key.ToLower());
                }
                catch (InvalidOperationException ex)
                {
                    var ids = string.Join(", ", Languages.Select(i => i.Id));
                    throw new InvalidOperationException(
                        $"Key '{key}' not found. Available Ids: [{ids}]",
                        ex
                    );
                }
            }
        }
    }
}