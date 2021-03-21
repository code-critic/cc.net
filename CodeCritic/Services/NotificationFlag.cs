namespace Cc.Net.Services
{
    public class NotificationFlag
    {
        private bool Touched { get; set; } = true;

        public void Touch()
        {
            Touched = true;
        }
        
        public void TouchIf(long n)
        {
            if (n > 0)
            {
                Touch();
            }
        }

        public void Clear()
        {
            Touched = false;
        }
        
        public bool WasTouched() => Touched;
    }
}