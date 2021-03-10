using System.Linq;

namespace CC.Net.Services
{
    public partial class ProcessStatus : IJson
    {
        public ProcessStatusCodes Code { get; internal set; }
        public int Value => (int) Code;
        public string Name { get; internal set; }
        public string Description { get; internal set; }
        public string Letter { get; internal set; }


        public ProcessStatus(ProcessStatusCodes code, string name, string description, string letter)
        {
            Code = code;
            Name = name;
            Description = description;
            Letter = letter;
        }

        public string AsJson()
        {
            return @$"{{
                code: ProcessStatusCodes.{Code},
                value: {Value},
                name: ""{Name}"",
                description: ""{Description}"",
                letter: ""{Letter}"",
            }}";
        }

        public override string ToString()
        {
            return Code.ToString();
        }

        public override bool Equals(object obj)
        {
            if(obj is ProcessStatus)
            {
                var code = (obj as ProcessStatus).Code;
                return Code.Equals(code);
            }
            return base.Equals(obj);
        }

        public override int GetHashCode()
        {
            return Code.GetHashCode();
        }

        public static ProcessStatus Get(int value) {
            return All.FirstOrDefault(i => i.Value == value) ?? UknownStatus;
        }

        public static ProcessStatus Get(ProcessStatusCodes code) {
            return All.First(i => i.Value == (int)code);
        }
    }
}