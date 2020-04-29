using System.Linq;

namespace CC.Net.Services
{
    public partial class ProcessStatus
    {
        public ProcessStatusCodes Code { get; internal set; }
        public int Value => (int) Code;
        public string Name { get; internal set; }
        public string Description { get; internal set; }


        public ProcessStatus(ProcessStatusCodes code, string name, string description = null)
        {
            Code = code;
            Name = name;
            Description = description;
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
            return All.First(i => i.Value == value);
        }

        public static ProcessStatus Get(ProcessStatusCodes code) {
            return All.First(i => i.Value == (int)code);
        }
    }
}