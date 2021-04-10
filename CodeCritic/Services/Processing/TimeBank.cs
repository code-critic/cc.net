using Cc.Net.Extensions;
using CC.Net.Services.Languages;

namespace cc.net.Services.Processing
{
    public class TimeBank
    {
        public TimeBank(Language language, double deadline)
        {
            Language = language;
            Deadline = deadline;
        }

        public double TimeLeft => LanguageDeadline - WallTime;
        public bool IsBusted()
        {
            return LanguageDeadline - WallTime < 1;
        }
        public Language Language { get; }

        public double WallTime { get; set; }

        public double Deadline { get; }
        
        public double LanguageDeadline => Deadline.ScaleTo(Language);
    }
}