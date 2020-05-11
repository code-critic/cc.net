using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using CC.Net.Config;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace CC.Net.Services
{

    //{"eppn":"jan.hybs@tul.cz","affiliation":"member@tul.cz;employee@tul.cz;student@tul.cz;faculty@tul.cz","datetime":"20200421--173841"}            
    public class AppUser
    {
        [JsonProperty("eppn")]
        public string Eppn { get; set; }

        [JsonProperty("affiliation")]
        public string Affiliation { get; set; }

        [JsonProperty("datetime")]
        public string Datetime { get; set; }

        public string Id => Eppn.Split('@').First();

        public string Role { get; set; } = "student";

        public bool isRoot => Role == "root";

        public string Username => string.Join(' ',
            Id
            .Split('.')
            .Select(i => CultureInfo.CurrentCulture.TextInfo.ToTitleCase(i)));

        public string LastFirstName => string.Join(' ',
            Id
            .Split('.')
            .Reverse()
            .Select(i => CultureInfo.CurrentCulture.TextInfo.ToTitleCase(i)));

        public void Elevate()
        {
            if (!Affiliation.Contains("root"))
            {
                Role = "root";
                Affiliation = $"{Affiliation};root@tul.cz";
            }
        }

        public string Email => Eppn.Split('@').Skip(1).FirstOrDefault();
        public List<string> Roles => Affiliation.Split(";").Select(i => i.Split('@').First()).ToList();
    }

    public class CryptoService
    {
        private AppOptions _appOptions;
        private ILogger<CryptoService> _logger;

        public CryptoService(AppOptions appOptions, ILogger<CryptoService> logger)
        {
            _appOptions = appOptions;
            _logger = logger;
            _appOptions.AESKey = "SXVSqERWLUqchC2h";
        }

        public AppUser Decrypt(string data)
        {
            try
            {
                var @fixed = data.Replace(':', '/');
                var base64Bytes = Convert.FromBase64String(@fixed);

                var jsonstring = DecryptStringFromBytes_Aes(
                    base64Bytes,
                    Encoding.ASCII.GetBytes(_appOptions.AESKey),
                    Encoding.ASCII.GetBytes(_appOptions.AESKey)
                );

                Console.WriteLine(jsonstring);

                try
                {
                    return JsonConvert.DeserializeObject<AppUser>(jsonstring);
                }
                catch (Exception e)
                {
                    _logger.LogError(e, "Failed convert data to json");
                    return null;
                }
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Failed to parse aes data");
                return null;
            }
        }

        private string DecryptStringFromBytes_Aes(byte[] cipherText, byte[] Key, byte[] IV)
        {
            // Check arguments.
            if (cipherText == null || cipherText.Length <= 0)
                throw new ArgumentNullException("cipherText");
            if (Key == null || Key.Length <= 0)
                throw new ArgumentNullException("Key");
            if (IV == null || IV.Length <= 0)
                throw new ArgumentNullException("IV");

            // Declare the string used to hold
            // the decrypted text.
            string plaintext = null;

            // Create an Aes object
            // with the specified key and IV.
            using (var aesAlg = Aes.Create())
            {
                aesAlg.Key = Key;
                aesAlg.IV = IV;
                aesAlg.Mode = CipherMode.CBC;
                aesAlg.Padding = PaddingMode.Zeros;

                // Create a decryptor to perform the stream transform.
                var decryptor = aesAlg.CreateDecryptor(aesAlg.Key, aesAlg.IV);

                // Create the streams used for decryption.
                using var msDecrypt = new MemoryStream(cipherText);
                using var csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read);
                using var srDecrypt = new StreamReader(csDecrypt);
                // Read the decrypted bytes from the decrypting stream
                // and place them in a string.
                plaintext = srDecrypt.ReadToEnd();
            }

            return plaintext;
        }
    }
}