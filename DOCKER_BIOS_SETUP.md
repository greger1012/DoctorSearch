# Docker BIOS Virtualization Setup

Docker Desktop requires virtualization to be enabled in your computer's BIOS/UEFI settings. This guide will help you enable it.

## What is Virtualization?

Virtualization allows your computer to run virtual machines (like Docker containers). It's a hardware feature that must be enabled in BIOS before Docker can work.

## How to Enable Virtualization

### Step 1: Access BIOS/UEFI Settings

**Method A: During Boot (Most Common)**
1. **Restart your computer**
2. **As soon as the computer starts**, press one of these keys repeatedly:
   - `F2` (most common)
   - `F10`
   - `F12`
   - `Delete` or `Del`
   - `Esc`
3. Keep pressing until you see the BIOS/UEFI settings screen

**Method B: From Windows 10/11**
1. **Hold the `Shift` key** while clicking "Restart" in Windows
2. Select **"Troubleshoot"**
3. Select **"Advanced Options"**
4. Select **"UEFI Firmware Settings"** or **"BIOS Settings"**
5. Click **"Restart"**

### Step 2: Find Virtualization Settings

The location varies by manufacturer. Look for one of these terms:

**Common Names:**
- "Virtualization"
- "Intel Virtualization Technology" or "Intel VT-x"
- "AMD-V" or "SVM Mode"
- "Hyper-V"
- "Virtualization Technology"

**Common Locations:**
- **Advanced** → **CPU Configuration**
- **System Configuration**
- **Security** → **Virtualization**
- **Processor** or **CPU** settings
- **Chipset** settings

**Manufacturer-Specific:**
- **Dell**: Advanced → Virtualization
- **HP**: Advanced → System Options → Virtualization Technology
- **Lenovo**: Security → Virtualization
- **ASUS**: Advanced → CPU Configuration → Intel Virtualization Technology
- **Acer**: Advanced → Processor Configuration → Intel Virtualization Technology

### Step 3: Enable Virtualization

1. **Navigate to the virtualization setting**
2. **Change it to "Enabled"** (use arrow keys and Enter, or click)
3. **Save your changes**:
   - Usually press `F10` to "Save and Exit"
   - Or go to "Exit" → "Save Changes and Exit"
4. **Confirm** if prompted
5. **Your computer will restart**

### Step 4: Verify It Worked

1. **After restart, open Task Manager** (Ctrl+Shift+Esc)
2. **Go to "Performance" tab**
3. **Click "CPU"**
4. **Look at the bottom** - you should see "Virtualization: Enabled"

If it says "Disabled", virtualization is still not enabled. Try the steps again or check your computer's manual.

## Troubleshooting

### "I can't find the virtualization setting"

- **Check your computer's manual** - search online for "[Your brand/model] enable virtualization"
- **Some older computers don't support it** - Docker may not work on very old hardware
- **Some computers have it enabled by default** - try installing Docker anyway

### "I don't see a BIOS screen"

- Make sure you're pressing the key **as soon as the computer starts** (before Windows loads)
- Try different keys: F2, F10, F12, Delete
- Some computers show a message like "Press F2 for Setup" - watch for this

### "Virtualization is enabled but Docker still won't start"

1. **Make sure Hyper-V is disabled** (if you're on Windows Pro):
   - Open "Turn Windows features on or off"
   - Uncheck "Hyper-V" if it's enabled
   - Restart

2. **Check Windows Defender**:
   - Some antivirus software blocks virtualization
   - Temporarily disable it to test

3. **Update your BIOS**:
   - Check your manufacturer's website for BIOS updates
   - Older BIOS versions may have issues

### "I'm on a work/school computer"

- You may need **administrator access** to change BIOS settings
- Some organizations disable virtualization for security
- Contact your IT department

## Alternative: If Virtualization Can't Be Enabled

If you absolutely cannot enable virtualization:

1. **Use a different computer** that supports it
2. **Use a cloud service** like Railway or Render (but this requires more setup)
3. **Contact support** - we may be able to provide alternative solutions

## Quick Reference

**Common BIOS Keys:**
- F2, F10, F12, Delete, Esc

**What to Enable:**
- "Virtualization", "Intel VT-x", "AMD-V", or "SVM Mode"

**Where to Find It:**
- Advanced → CPU Configuration (most common)

**How to Save:**
- F10 (Save and Exit)

## Still Need Help?

1. **Search online**: "[Your computer brand/model] enable virtualization BIOS"
2. **Check manufacturer's website** for your specific model
3. **Contact your computer's support** - they can guide you through BIOS settings

---

**Note**: Enabling virtualization is safe and doesn't affect your computer's normal operation. It's a standard feature that many programs use.

