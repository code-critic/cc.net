

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using CC.Net.Config;
using CC.Net.Utils;

namespace CC.Net.Services.Languages
{
    public class LanguageService
    {
        private readonly AppOptions _appOptions;
        public readonly List<Language> Languages;

        public LanguageService(AppOptions appOptions)
        {
            _appOptions = appOptions;
            Languages = Parse();
        }

        private List<Language> Parse()
        {
            var file = $"{_appOptions.ConfigDir}/langs.yaml";
            return YamlRead.Read<List<Language>>(file);
        }

        public Language this[string key]
        {
            get => Languages.First(i => i.Id.ToLower() == key.ToLower());
        }
    }
}