document.addEventListener('DOMContentLoaded', async () => {
  // Common Elements
  const btnMinimize = document.getElementById('btn-minimize');
  const btnClose = document.getElementById('btn-close');

  // Normal Install Elements
  const stage = document.querySelector('.carousel-stage');
  const bottomBar = document.querySelector('.installer-bottom-bar');
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  const progressFill = document.getElementById('progress-fill');
  const percentText = document.getElementById('percent-text');
  const statusText = document.getElementById('status-text');
  const statusSpinner = document.getElementById('status-spinner');
  const btnMore = document.getElementById('btn-more');
  const moreDrawer = document.getElementById('more-drawer');
  const btnCloseDrawer = document.getElementById('btn-close-drawer');
  const inputInstallPath = document.getElementById('input-install-path');
  const btnBrowseFolder = document.getElementById('btn-browse-folder');
  const chkDesktop = document.getElementById('chk-desktop');
  const chkStartmenu = document.getElementById('chk-startmenu');
  const chkLaunch = document.getElementById('chk-launch');
  const chkFinishLaunch = document.getElementById('chk-finish-launch');
  const btnFinish = document.getElementById('btn-finish');
  const finishedActionRow = document.getElementById('finished-action-row');
  const progressSection = document.getElementById('progress-section');

  // Maintenance Elements
  const maintStage = document.getElementById('maintenance-stage');
  const maintBadgeText = document.getElementById('maint-badge-text');
  const maintBadgePath = document.getElementById('maint-badge-path');
  const btnMaintRepair = document.getElementById('btn-maint-repair');
  const btnMaintUninstall = document.getElementById('btn-maint-uninstall');
  const btnMaintExit = document.getElementById('btn-maint-exit');
  const maintUninstallConfirm = document.getElementById('maint-uninstall-confirm');
  const btnCancelUninstall = document.getElementById('btn-cancel-uninstall');
  const btnConfirmUninstall = document.getElementById('btn-confirm-uninstall');
  const chkMaintDeleteUserData = document.getElementById('chk-maint-delete-user-data');
  const maintProgressOverlay = document.getElementById('maint-progress-overlay');
  const maintOpSpinner = document.getElementById('maint-op-spinner');
  const maintFinishCheck = document.getElementById('maint-finish-check');
  const maintOpTitle = document.getElementById('maint-op-title');
  const maintOpStatus = document.getElementById('maint-op-status');
  const maintProgressFill = document.getElementById('maint-progress-fill');
  const maintProgressPct = document.getElementById('maint-progress-pct');
  const maintDoneActions = document.getElementById('maint-done-actions');
  const lblMaintLaunch = document.getElementById('lbl-maint-launch');
  const chkMaintLaunch = document.getElementById('chk-maint-launch');
  const btnMaintDoneFinish = document.getElementById('btn-maint-done-finish');

  let currentSlide = 0;
  let slideTimer = null;
  let installedExePath = null;
  let isInstalling = false;
  let lastMilestone = -1;
  let currentMaintAction = null; // 'repair' | 'uninstall' | null

  // Window Controls
  btnMinimize?.addEventListener('click', () => {
    window.installerApi?.minimize();
  });

  btnClose?.addEventListener('click', () => {
    window.installerApi?.close();
  });

  // Carousel Functionality
  function showSlide(index) {
    if (!slides.length) return;
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    currentSlide = index;

    slides.forEach((s, i) => {
      s.classList.toggle('active', i === index);
    });

    dots.forEach((d, i) => {
      d.classList.toggle('active', i === index);
    });
  }

  function startSlideTimer() {
    stopSlideTimer();
    slideTimer = setInterval(() => {
      showSlide(currentSlide + 1);
    }, 2200);
  }

  function stopSlideTimer() {
    if (slideTimer) {
      clearInterval(slideTimer);
      slideTimer = null;
    }
  }

  dots.forEach((d) => {
    d.addEventListener('click', () => {
      const idx = parseInt(d.dataset.index, 10);
      showSlide(idx);
      startSlideTimer();
    });
  });

  stage?.addEventListener('mouseenter', stopSlideTimer);
  stage?.addEventListener('mouseleave', () => {
    if (isInstalling && (!finishedActionRow || finishedActionRow.classList.contains('hidden'))) {
      startSlideTimer();
    }
  });

  // Check Installation Status on Launch
  let installInfo = null;
  try {
    if (window.installerApi?.checkInstalled) {
      installInfo = await window.installerApi.checkInstalled();
    }
  } catch (err) {
    console.warn('Failed to query install status:', err);
  }

  // Load default install path
  let defaultPath = 'C:\\Users\\Default\\AppData\\Local\\Programs\\FormaLux';
  try {
    if (window.installerApi?.getDefaultPath) {
      defaultPath = await window.installerApi.getDefaultPath();
    }
  } catch (e) {
    console.warn(e);
  }
  if (inputInstallPath) inputInstallPath.value = (installInfo && installInfo.installLocation) ? installInfo.installLocation : defaultPath;

  // More drawer toggle
  btnMore?.addEventListener('click', () => {
    moreDrawer?.classList.toggle('hidden');
  });

  btnCloseDrawer?.addEventListener('click', () => {
    moreDrawer?.classList.add('hidden');
  });

  btnBrowseFolder?.addEventListener('click', async () => {
    try {
      const folder = await window.installerApi?.selectFolder();
      if (folder && inputInstallPath) {
        inputInstallPath.value = folder;
      }
    } catch (e) {
      console.warn(e);
    }
  });

  // Sync checkboxes between drawer and finish screen
  chkLaunch?.addEventListener('change', () => {
    if (chkFinishLaunch) chkFinishLaunch.checked = chkLaunch.checked;
  });
  chkFinishLaunch?.addEventListener('change', () => {
    if (chkLaunch) chkLaunch.checked = chkFinishLaunch.checked;
  });

  // Shared Progress Listener
  window.installerApi?.onProgress((data) => {
    const { percent, status, step } = data;

    // 1. Normal Install Progress
    if (progressFill && percent !== undefined) {
      progressFill.style.width = `${percent}%`;
      if (percentText) percentText.textContent = `${percent}%`;

      if (percent < 100) {
        const milestone = Math.min(slides.length - 1, Math.floor((percent / 100) * slides.length));
        if (milestone > lastMilestone) {
          lastMilestone = milestone;
          showSlide(milestone);
        }
      }
    }
    if (status && statusText) {
      statusText.textContent = status;
    }

    if (!currentMaintAction && (percent === 100 || step === 'done')) {
      stopSlideTimer();
      if (progressFill) {
        progressFill.style.background = 'linear-gradient(90deg, #10b981, #06b6d4)';
        progressFill.style.boxShadow = '0 0 16px rgba(16, 185, 129, 0.6)';
      }
      if (statusSpinner) statusSpinner.style.display = 'none';

      setTimeout(() => {
        progressSection?.classList.add('hidden');
        finishedActionRow?.classList.remove('hidden');
      }, 500);
    }

    // 2. Maintenance Progress (Repair / Uninstall)
    if (currentMaintAction) {
      if (percent !== undefined && maintProgressFill && maintProgressPct) {
        maintProgressFill.style.width = `${percent}%`;
        maintProgressPct.textContent = `${percent}%`;
      }
      if (status && maintOpStatus) {
        maintOpStatus.textContent = status;
      }

      if (percent === 100 || step === 'done') {
        if (maintOpSpinner) maintOpSpinner.classList.add('hidden');
        if (maintFinishCheck) maintFinishCheck.classList.remove('hidden');
        if (maintProgressFill) {
          maintProgressFill.style.background = 'linear-gradient(90deg, #10b981, #06b6d4)';
          maintProgressFill.style.boxShadow = '0 0 16px rgba(16, 185, 129, 0.6)';
        }

        if (currentMaintAction === 'repair') {
          if (maintOpTitle) maintOpTitle.textContent = 'Repair Completed Successfully!';
          if (maintOpStatus) maintOpStatus.textContent = 'FormaLux has been verified, restored, and is ready to use.';
          if (lblMaintLaunch) lblMaintLaunch.classList.remove('hidden');
          if (btnMaintDoneFinish) btnMaintDoneFinish.querySelector('span').textContent = 'Finish';
        } else if (currentMaintAction === 'uninstall') {
          if (maintOpTitle) maintOpTitle.textContent = 'Uninstallation Complete';
          if (maintOpStatus) maintOpStatus.textContent = 'FormaLux has been completely removed from your computer.';
          if (lblMaintLaunch) lblMaintLaunch.classList.add('hidden');
          if (btnMaintDoneFinish) btnMaintDoneFinish.querySelector('span').textContent = 'Close';
        }

        setTimeout(() => {
          maintDoneActions?.classList.remove('hidden');
        }, 400);
      }
    }
  });

  // Finish button (Normal Install)
  btnFinish?.addEventListener('click', () => {
    const shouldLaunch = chkFinishLaunch ? chkFinishLaunch.checked : (chkLaunch ? chkLaunch.checked : true);
    if (shouldLaunch) {
      window.installerApi?.launchApp(installedExePath);
    } else {
      window.installerApi?.close();
    }
  });

  // Finish button (Maintenance Operation Done)
  btnMaintDoneFinish?.addEventListener('click', () => {
    if (currentMaintAction === 'repair') {
      const shouldLaunch = chkMaintLaunch?.checked ?? true;
      if (shouldLaunch) {
        const exe = installInfo?.exePath || (installInfo?.installLocation ? (installInfo.installLocation + '\\FormaLux.exe') : null);
        window.installerApi?.launchApp(exe);
      } else {
        window.installerApi?.close();
      }
    } else {
      window.installerApi?.close();
    }
  });

  // ==========================================
  // BRANCH: IF ALREADY INSTALLED -> SHOW MAINTENANCE
  // ==========================================
  if (installInfo && installInfo.isInstalled) {
    stopSlideTimer();

    // Hide normal installation stages
    stage?.classList.add('hidden');
    bottomBar?.classList.add('hidden');

    // Show Maintenance UI
    maintStage?.classList.remove('hidden');

    if (maintBadgeText) {
      maintBadgeText.textContent = `Version ${installInfo.displayVersion || '1.0.0'}`;
    }
    if (maintBadgePath) {
      maintBadgePath.textContent = installInfo.installLocation;
      maintBadgePath.title = installInfo.installLocation;
    }

    // Cancel & Exit
    btnMaintExit?.addEventListener('click', () => {
      window.installerApi?.close();
    });

    // Repair Button Click
    btnMaintRepair?.addEventListener('click', async () => {
      currentMaintAction = 'repair';

      if (maintOpTitle) maintOpTitle.textContent = 'Repairing FormaLux Installation...';
      if (maintOpStatus) maintOpStatus.textContent = 'Preparing clean application files...';
      if (maintProgressFill) maintProgressFill.style.width = '5%';
      if (maintProgressPct) maintProgressPct.textContent = '5%';
      if (maintOpSpinner) maintOpSpinner.classList.remove('hidden');
      if (maintFinishCheck) maintFinishCheck.classList.add('hidden');
      maintDoneActions?.classList.add('hidden');

      maintProgressOverlay?.classList.remove('hidden');

      try {
        const opts = {
          installPath: installInfo.installLocation,
          createDesktopShortcut: true,
          createStartMenuShortcut: true,
          isRepair: true,
        };
        const result = await window.installerApi?.startInstall(opts);
        if (result && result.exePath) {
          installedExePath = result.exePath;
        }
      } catch (err) {
        console.error('Repair failed:', err);
        if (maintOpStatus) {
          maintOpStatus.textContent = 'Repair failed: ' + (err.message || 'Unknown error');
          maintOpStatus.style.color = '#ef4444';
        }
        if (maintOpSpinner) maintOpSpinner.classList.add('hidden');
      }
    });

    // Uninstall Button Click -> Show Confirm Modal
    btnMaintUninstall?.addEventListener('click', () => {
      maintUninstallConfirm?.classList.remove('hidden');
    });

    btnCancelUninstall?.addEventListener('click', () => {
      maintUninstallConfirm?.classList.add('hidden');
    });

    // Confirm Uninstall Click -> Execute Uninstallation
    btnConfirmUninstall?.addEventListener('click', async () => {
      maintUninstallConfirm?.classList.add('hidden');
      currentMaintAction = 'uninstall';

      if (maintOpTitle) maintOpTitle.textContent = 'Uninstalling FormaLux Complete Suite...';
      if (maintOpStatus) maintOpStatus.textContent = 'Stopping active background processes...';
      if (maintProgressFill) maintProgressFill.style.width = '10%';
      if (maintProgressPct) maintProgressPct.textContent = '10%';
      if (maintOpSpinner) maintOpSpinner.classList.remove('hidden');
      if (maintFinishCheck) maintFinishCheck.classList.add('hidden');
      maintDoneActions?.classList.add('hidden');

      maintProgressOverlay?.classList.remove('hidden');

      try {
        const deleteUserData = chkMaintDeleteUserData?.checked ?? true;
        await window.installerApi?.startUninstall({
          installPath: installInfo.installLocation,
          deleteUserData,
        });
      } catch (err) {
        console.error('Uninstall failed:', err);
        if (maintOpStatus) {
          maintOpStatus.textContent = 'Uninstallation failed: ' + (err.message || 'Unknown error');
          maintOpStatus.style.color = '#ef4444';
        }
        if (maintOpSpinner) maintOpSpinner.classList.add('hidden');
      }
    });

    return; // Stop here! Do not proceed to auto-install!
  }

  // ==========================================
  // BRANCH: FRESH INSTALL (NOT PREVIOUSLY INSTALLED)
  // ==========================================
  startSlideTimer();

  setTimeout(async () => {
    if (isInstalling) return;
    isInstalling = true;

    try {
      const opts = {
        installPath: inputInstallPath?.value || defaultPath,
        createDesktopShortcut: chkDesktop?.checked ?? true,
        createStartMenuShortcut: chkStartmenu?.checked ?? true,
        isRepair: false,
      };

      const result = await window.installerApi?.startInstall(opts);
      if (result && result.exePath) {
        installedExePath = result.exePath;
      }
    } catch (err) {
      console.error('Installation failed:', err);
      if (statusText) {
        statusText.textContent = 'Installation failed: ' + (err.message || 'Error occurred');
        statusText.style.color = '#ef4444';
      }
      if (statusSpinner) statusSpinner.style.display = 'none';
    }
  }, 1200);
});
