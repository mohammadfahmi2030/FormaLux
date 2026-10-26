// ===============================================
// FormaLux — Master Renderer Application Logic
// ===============================================

(function () {
  'use strict';

  // ========== State ==========
  let settings = {};
  let tasks = [];
  let selectedTaskId = null;
  let activeSection = 'video';
  let currentToolType = null;
  let currentToolFiles = [];
  let elapsedTimer = null;
  let elapsedSeconds = 0;
  let isConverting = false;
  let currentLang = 'ar';
  let currentTheme = 'default';
  let openDropdownId = null;

  // Format Task Modal State
  let currentFormatTool = null;
  let currentMediaType = 'video'; // 'video' | 'audio' | 'image'
  let formatFiles = []; // [{ path, name, size, duration, resolution, rawInfo, checked }]
  let selectedFormatFileIndex = -1;
  let currentPresetKey = 'optimum';
  let currentPresetName = 'Optimum quality and size';
  let currentFormatOptions = {};
  let formatSubtab = 'files';

  // ========== Format Presets ==========
  const VIDEO_PRESETS = {
    optimum: {
      name: 'Optimum quality and size',
      sizeLimit: 'Off',
      videoEncode: 'AVC(H264)',
      videoSize: '<1080p',
      bitrate: 'Default',
      crf: '23',
      gpu: 'Auto',
      fps: 'Default',
      aspectRatio: 'Automatic',
      encode2Pass: 'No',
      keyframe: 'Default',
      deinterlace: 'No',
      rotate: 'No',
      xMirror: 'No',
      yMirror: 'No',
      filter: 'Off',
      fadeIn: 'Off',
      fadeOut: 'Off',
      antiShake: 'Off',
      denoise: 'No',
      reverse: 'No',
      audioEncode: 'AAC',
      audioSampleRate: '44100',
      audioBitrate: '192',
      audioChannel: 'Default',
      audioVolume: '100',
    },
    high_2pass: {
      name: 'High quality and size Encode 2 Pass',
      sizeLimit: 'Off',
      videoEncode: 'AVC(H264)',
      videoSize: '1080p',
      bitrate: '8000k',
      crf: '18',
      gpu: 'Auto',
      fps: 'Default',
      aspectRatio: 'Automatic',
      encode2Pass: 'Yes',
      keyframe: 'Default',
      deinterlace: 'No',
      rotate: 'No',
      xMirror: 'No',
      yMirror: 'No',
      filter: 'Off',
      fadeIn: 'Off',
      fadeOut: 'Off',
      antiShake: 'Off',
      denoise: 'No',
      reverse: 'No',
      audioEncode: 'AAC',
      audioSampleRate: '48000',
      audioBitrate: '320',
      audioChannel: 'Default',
      audioVolume: '100',
    },
    high: {
      name: 'High quality and size',
      sizeLimit: 'Off',
      videoEncode: 'AVC(H264)',
      videoSize: '1080p',
      bitrate: '8000k',
      crf: '20',
      gpu: 'Auto',
      fps: 'Default',
      aspectRatio: 'Automatic',
      encode2Pass: 'No',
      keyframe: 'Default',
      deinterlace: 'No',
      rotate: 'No',
      xMirror: 'No',
      yMirror: 'No',
      filter: 'Off',
      fadeIn: 'Off',
      fadeOut: 'Off',
      antiShake: 'Off',
      denoise: 'No',
      reverse: 'No',
      audioEncode: 'AAC',
      audioSampleRate: '48000',
      audioBitrate: '256',
      audioChannel: 'Default',
      audioVolume: '100',
    },
    medium: {
      name: 'Medium quality and size',
      sizeLimit: 'Off',
      videoEncode: 'AVC(H264)',
      videoSize: '720p',
      bitrate: '2500k',
      crf: '24',
      gpu: 'Auto',
      fps: 'Default',
      aspectRatio: 'Automatic',
      encode2Pass: 'No',
      keyframe: 'Default',
      deinterlace: 'No',
      rotate: 'No',
      xMirror: 'No',
      yMirror: 'No',
      filter: 'Off',
      fadeIn: 'Off',
      fadeOut: 'Off',
      antiShake: 'Off',
      denoise: 'No',
      reverse: 'No',
      audioEncode: 'AAC',
      audioSampleRate: '44100',
      audioBitrate: '192',
      audioChannel: 'Default',
      audioVolume: '100',
    },
    low: {
      name: 'Low quality and size',
      sizeLimit: 'Off',
      videoEncode: 'AVC(H264)',
      videoSize: '480p',
      bitrate: '1200k',
      crf: '28',
      gpu: 'Auto',
      fps: 'Default',
      aspectRatio: 'Automatic',
      encode2Pass: 'No',
      keyframe: 'Default',
      deinterlace: 'No',
      rotate: 'No',
      xMirror: 'No',
      yMirror: 'No',
      filter: 'Off',
      fadeIn: 'Off',
      fadeOut: 'Off',
      antiShake: 'Off',
      denoise: 'No',
      reverse: 'No',
      audioEncode: 'AAC',
      audioSampleRate: '44100',
      audioBitrate: '128',
      audioChannel: 'Default',
      audioVolume: '100',
    },
    '4k': {
      name: '4K 2160p',
      sizeLimit: 'Off',
      videoEncode: 'HEVC(H265)',
      videoSize: '4K 2160p',
      bitrate: '16000k',
      crf: '20',
      gpu: 'Auto',
      fps: '60',
      aspectRatio: '16:9',
      encode2Pass: 'No',
      keyframe: 'Default',
      deinterlace: 'No',
      rotate: 'No',
      xMirror: 'No',
      yMirror: 'No',
      filter: 'Off',
      fadeIn: 'Off',
      fadeOut: 'Off',
      antiShake: 'Off',
      denoise: 'No',
      reverse: 'No',
      audioEncode: 'AAC',
      audioSampleRate: '48000',
      audioBitrate: '320',
      audioChannel: 'Default',
      audioVolume: '100',
    },
    '2k': {
      name: '2K 1080p',
      sizeLimit: 'Off',
      videoEncode: 'AVC(H264)',
      videoSize: '1080p',
      bitrate: '8000k',
      crf: '21',
      gpu: 'Auto',
      fps: '60',
      aspectRatio: '16:9',
      encode2Pass: 'No',
      keyframe: 'Default',
      deinterlace: 'No',
      rotate: 'No',
      xMirror: 'No',
      yMirror: 'No',
      filter: 'Off',
      fadeIn: 'Off',
      fadeOut: 'Off',
      antiShake: 'Off',
      denoise: 'No',
      reverse: 'No',
      audioEncode: 'AAC',
      audioSampleRate: '48000',
      audioBitrate: '256',
      audioChannel: 'Default',
      audioVolume: '100',
    },
    '720p': {
      name: '720p',
      sizeLimit: 'Off',
      videoEncode: 'AVC(H264)',
      videoSize: '720p',
      bitrate: '3500k',
      crf: '23',
      gpu: 'Auto',
      fps: '30',
      aspectRatio: '16:9',
      encode2Pass: 'No',
      keyframe: 'Default',
      deinterlace: 'No',
      rotate: 'No',
      xMirror: 'No',
      yMirror: 'No',
      filter: 'Off',
      fadeIn: 'Off',
      fadeOut: 'Off',
      antiShake: 'Off',
      denoise: 'No',
      reverse: 'No',
      audioEncode: 'AAC',
      audioSampleRate: '44100',
      audioBitrate: '192',
      audioChannel: 'Default',
      audioVolume: '100',
    },
    '480p': {
      name: '480p',
      sizeLimit: 'Off',
      videoEncode: 'AVC(H264)',
      videoSize: '480p',
      bitrate: '1500k',
      crf: '26',
      gpu: 'Auto',
      fps: '30',
      aspectRatio: 'Automatic',
      encode2Pass: 'No',
      keyframe: 'Default',
      deinterlace: 'No',
      rotate: 'No',
      xMirror: 'No',
      yMirror: 'No',
      filter: 'Off',
      fadeIn: 'Off',
      fadeOut: 'Off',
      antiShake: 'Off',
      denoise: 'No',
      reverse: 'No',
      audioEncode: 'AAC',
      audioSampleRate: '44100',
      audioBitrate: '128',
      audioChannel: 'Default',
      audioVolume: '100',
    },
    copy: {
      name: 'Copy Stream',
      sizeLimit: 'Off',
      videoEncode: 'Copy',
      videoSize: 'Automatic',
      bitrate: 'Default',
      crf: 'Off',
      gpu: 'Off',
      fps: 'Default',
      aspectRatio: 'Automatic',
      encode2Pass: 'No',
      keyframe: 'Default',
      deinterlace: 'No',
      rotate: 'No',
      xMirror: 'No',
      yMirror: 'No',
      filter: 'Off',
      fadeIn: 'Off',
      fadeOut: 'Off',
      antiShake: 'Off',
      denoise: 'No',
      reverse: 'No',
      audioEncode: 'Copy',
      audioSampleRate: 'Default',
      audioBitrate: 'Default',
      audioChannel: 'Default',
      audioVolume: '100',
    },
    custom: {
      name: 'Custom',
    }
  };

  const AUDIO_PRESETS = {
    high: {
      name: 'High quality',
      audioEncode: 'MP3',
      sampleRate: '48000',
      bitrate: '320',
      channel: '2',
      volume: '100',
      vbr: 'Off',
      sampleFormat: 's16p',
      fadeIn: 'No',
      fadeOut: 'No',
      echo: 'No',
      denoise: 'No',
      reverse: 'No',
    },
    medium: {
      name: 'Medium quality',
      audioEncode: 'MP3',
      sampleRate: '44100',
      bitrate: '192',
      channel: '2',
      volume: '100',
      vbr: 'Off',
      sampleFormat: 'Default',
      fadeIn: 'No',
      fadeOut: 'No',
      echo: 'No',
      denoise: 'No',
      reverse: 'No',
    },
    low: {
      name: 'Low quality',
      audioEncode: 'MP3',
      sampleRate: '44100',
      bitrate: '128',
      channel: '2',
      volume: '100',
      vbr: 'Off',
      sampleFormat: 'Default',
      fadeIn: 'No',
      fadeOut: 'No',
      echo: 'No',
      denoise: 'No',
      reverse: 'No',
    },
    vbr_0: {
      name: 'VBR 0 (Best quality)',
      audioEncode: 'MP3',
      sampleRate: '48000',
      bitrate: 'Default',
      channel: '2',
      volume: '100',
      vbr: '0',
      sampleFormat: 's16p',
      fadeIn: 'No',
      fadeOut: 'No',
      echo: 'No',
      denoise: 'No',
      reverse: 'No',
    },
    vbr_2: {
      name: 'VBR 2 (High quality)',
      audioEncode: 'MP3',
      sampleRate: '44100',
      bitrate: 'Default',
      channel: '2',
      volume: '100',
      vbr: '2',
      sampleFormat: 's16p',
      fadeIn: 'No',
      fadeOut: 'No',
      echo: 'No',
      denoise: 'No',
      reverse: 'No',
    },
    vbr_4: {
      name: 'VBR 4 (Standard quality)',
      audioEncode: 'MP3',
      sampleRate: '44100',
      bitrate: 'Default',
      channel: '2',
      volume: '100',
      vbr: '4',
      sampleFormat: 'Default',
      fadeIn: 'No',
      fadeOut: 'No',
      echo: 'No',
      denoise: 'No',
      reverse: 'No',
    },
    copy: {
      name: 'Copy Stream',
      audioEncode: 'Copy',
      sampleRate: 'Default',
      bitrate: 'Default',
      channel: 'Default',
      volume: '100',
      vbr: 'Off',
      sampleFormat: 'Default',
      fadeIn: 'No',
      fadeOut: 'No',
      echo: 'No',
      denoise: 'No',
      reverse: 'No',
    },
    custom: {
      name: 'Custom',
    }
  };

  const PICTURE_PRESETS = {
    original: {
      name: 'Original Size',
      quality: '90',
      limitWidth: 0,
      limitHeight: 0,
      rotate: 'No',
      flip: 'No',
    },
    '50': {
      name: '50% Original Size',
      quality: '90',
      limitWidth: 0,
      limitHeight: 0,
      rotate: 'No',
      flip: 'No',
    },
    '75': {
      name: '75% Original Size',
      quality: '90',
      limitWidth: 0,
      limitHeight: 0,
      rotate: 'No',
      flip: 'No',
    },
    '1080': {
      name: '1920x1080 (Full HD)',
      quality: '95',
      limitWidth: 1920,
      limitHeight: 1080,
      rotate: 'No',
      flip: 'No',
    },
    '720': {
      name: '1280x720 (HD)',
      quality: '90',
      limitWidth: 1280,
      limitHeight: 720,
      rotate: 'No',
      flip: 'No',
    },
    '800': {
      name: '800x600 (Web)',
      quality: '85',
      limitWidth: 800,
      limitHeight: 600,
      rotate: 'No',
      flip: 'No',
    },
    avatar: {
      name: 'Avatar 1:1 Square',
      quality: '90',
      limitWidth: 500,
      limitHeight: 500,
      rotate: 'No',
      flip: 'No',
    },
    custom: {
      name: 'Custom Size',
    }
  };

  // ========== i18n Translations Dictionary ==========
  const I18N = {
    ar: {
      dir: 'rtl',
      app_title: 'FormaLux — مصنع التحويل الفاخر',
      // Menus
      menu_task: 'المهمة',
      menu_theme: 'المظهر',
      menu_language: 'اللغة',
      menu_options: 'الخيارات',
      menu_help: 'مساعدة',
      // Task Menu Items
      menu_start: 'بدء التحويل',
      menu_stop: 'إيقاف مؤقت / إلغاء',
      menu_remove: 'إزالة المحدد من القائمة',
      menu_clear: 'تفريغ القائمة بالكامل',
      menu_output_folder: 'فتح مجلد الإخراج',
      menu_exit: 'خروج من البرنامج',
      // Themes
      theme_nebula: 'كحلي نيبولا الفاخر (الافتراضي)',
      theme_oled: 'أسود أوليد فاحم (OLED)',
      theme_cyber: 'سايبر نيون متوهج',
      theme_emerald: 'زمردي ملكي',
      theme_light: 'كلاسيكي فاتح (Classic Light)',
      // Options Menu
      menu_settings: 'إعدادات البرنامج',
      menu_ha_test: 'اختبار تسريع العتاد (HA Test)',
      menu_reset_defaults: 'استعادة الضبط الافتراضي',
      // Help Menu
      menu_homepage: 'الصفحة الرئيسية',
      menu_check_updates: 'التحقق من الإصدار الجديد',
      menu_changelog: 'تحديث السجل',
      menu_about: 'عن FormaLux',
      // Toolbar
      tb_output_folder: 'مجلد الإخراج',
      tb_options: 'الخيارات',
      tb_remove: 'إزالة',
      tb_clear: 'حذف القائمة',
      tb_stop: 'إيقاف',
      tb_start: 'بدء',
      // Categories
      cat_video: 'الفيديو',
      cat_audio: 'الصوت',
      cat_image: 'الصورة',
      cat_document: 'وثيقة',
      cat_disc: 'أجهزة القراءة',
      cat_tools: 'الأدوات المساعدة',
      // Task Table
      col_preview: 'عرض',
      col_source: 'المصدر',
      col_output: 'الإخراج / حالة التحويل',
      empty_title: 'اسحب الملفات هنا أو اختر أداة من القائمة',
      empty_subtitle: 'Drag files here or select a tool from the sidebar',
      // Status bar
      status_multithread: 'Use Multi-Threads',
      status_shutdown: 'بعد التحويل: إيقاف تشغيل الكمبيوتر',
      status_notify: 'إشعار بالاكتمال',
      status_elapsed: 'الوقت المنقضي',
      // Modals
      modal_options_title: 'الخيارات',
      tab_general: 'الخيارات العامة',
      tab_advanced: 'المتقدمة',
      grp_output: 'مجلد الإخراج',
      btn_change: 'تغيير',
      opt_same_folder: 'الإخراج إلى نفس المجلد الأصلي',
      opt_sub_folder: 'إنشاء مجلد فرعي باسم FormaLux',
      grp_post: 'بعد التحويل',
      opt_shutdown: 'إيقاف تشغيل الكمبيوتر بعد اكتمال جميع المهام',
      opt_open_folder: 'فتح مجلد الإخراج تلقائياً عند الانتهاء',
      grp_sound: 'أصوات التنبيه',
      opt_sound_general: 'أصوات الواجهة العامة',
      opt_sound_complete: 'إشعار صوتي عند اكتمال التحويل بنجاح',
      opt_sound_fail: 'إشعار صوتي عند فشل عملية التحويل',
      grp_system: 'النظام والتشغيل',
      opt_context_menu: 'إضافة إلى قائمة زر الفأرة الأيمن (Context Menu)',
      opt_check_updates: 'التحقق التلقائي من التحديثات',
      opt_minimize_tray: 'التصغير إلى صينية النظام بجوار الساعة (System Tray)',
      grp_gpu: 'تسريع كرت الشاشة (GPU Acceleration)',
      opt_gpu_auto: 'اكتشاف تسريع العتاد تلقائياً (Auto Detect)',
      btn_ha_test: 'HA Test',
      opt_gpu_desc: 'يدعم تسريع معالجات NVIDIA (NVENC)، وIntel (QuickSync)، وAMD (AMF).',
      grp_cpu: 'المعالج والتوازي (Multi-Threading)',
      opt_threads: 'استخدام التعددية المتزامنة',
      opt_show_usage: 'إظهار نسبة استهلاك المعالج في شريط الحالة',
      grp_img_quality: 'جودة حفظ الصور',
      btn_cancel: 'إلغاء',
      btn_apply: 'تطبيق',
      btn_ok: 'موافق',
      btn_add_files: 'إضافة ملفات',
      btn_add_folder: '+ إضافة مجلد',
      btn_add_music: '+ إضافة موسيقى',
      btn_confirm: 'تأكيد وإضافة للطابور',
      about_tagline: 'مصنع التحويل الفاخر للفيديو والصوت والصور والمستندات',
      // Status words
      st_queued: 'في الانتظار',
      st_converting: 'جاري التحويل...',
      st_completed: 'مكتمل ✓',
      st_failed: 'فشل ✗',
      st_cancelled: 'ملغي',
      // Alerts
      alert_updates_latest: 'أنت تستخدم أحدث إصدار من FormaLux (v1.0.0)',
      alert_reset_done: 'تمت استعادة إعدادات البرنامج الافتراضية بنجاح',
      alert_no_files: 'الرجاء إضافة ملف واحد على الأقل للمتابعة',
      // Tools Translations
      t_v_merge: 'دامج & Mux',
      t_v_enhance: 'تحسين وضغط',
      t_v_separate: 'الفاصل',
      t_v_crop: 'قص الإطار',
      t_v_clip: 'مقطع سريع',
      t_v_delogo: 'إزالة العلامة المائية',
      t_v_frames: 'إطارات التصدير',
      t_v_record: 'مسجل الشاشة',
      t_v_player: 'Format Player (مشغل)',
      t_v_download: 'تنزيل الفيديو',
      t_a_merge: 'دامج الصوت',
      t_a_split: 'تقسيم الموسيقى',
      t_a_extract: 'استخراج الصوت',
      t_a_mix: 'مزيج صوتي',
      t_a_tts: 'نص إلى صوت',
      t_d_pdf_join: 'PDF Joiner (دمج PDF)',
      t_d_compress: 'ضغط PDF',
      t_d_pic_pdf: 'صور إلى PDF',
      t_d_pdf_pic: 'PDF إلى صور',
      t_d_pdf_text: 'PDF إلى نص',
      t_d_pdf_docx: 'PDF إلى Word',
      t_d_pdf_excel: 'PDF إلى Excel',
      t_d_docx_pdf: 'Word إلى PDF',
      t_d_decrypt: 'فك تشفير PDF',
      t_d_encrypt: 'تشفير PDF',
      t_d_zip: 'FFZip (أرشيف)',
      t_disc_bluray: 'قرص Bluray إلى MKV',
      t_disc_dvd: 'DVD إلى ملف فيديو',
      t_disc_cd: 'أسطوانة الموسيقى إلى صوت',
      t_disc_iso: 'DVD/CD إلى ISO/CSO',
      t_disc_cso: 'ISO ↔ CSO',
      t_util_info: 'معلومات ملف الوسائط',
      t_util_rename: 'إعادة تسمية مجمعة',
      t_util_ha: 'اختبار تسريع العتاد (HA Test)',
      t_media_info_title: 'معلومات ملف الوسائط',
      btn_copy_clipboard: 'نسخ إلى الحافظة',
      copied_to_clipboard: 'تم النسخ!',
      t_rename_title: 'إعادة تسمية مجمعة',
      lbl_file_type: 'نوع الملف',
      lbl_entire_tree: 'المجلد والفروع بالكامل',
      lbl_format_group: 'التنسيق',
      lbl_pattern: 'النمط',
      lbl_delimiter: 'الفاصل',
      lbl_start_number: 'الرقم',
      lbl_date_group: 'التاريخ',
      lbl_date_format: 'التاريخ',
      lbl_time_format: 'الوقت',
      lbl_file_date: 'تاريخ الملف',
      lbl_current_date: 'التاريخ الحالي',
      lbl_photo_date: 'تاريخ الصورة',
      lbl_remove_group: 'حذف نص',
      lbl_remove_string: 'حذف النص',
      lbl_ignore_datetime: 'تجاهل حروف التاريخ والوقت',
      btn_rename_action: 'بدء إعادة التسمية',
      t_ha_test_title: 'Hardware Acceleration Testing',
      ha_probing: 'جارٍ اختبار تسريع العتاد للمشفرات...',
      rename_success: 'تمت إعادة تسمية {count} ملف بنجاح!',
      rename_no_files: 'لم يتم العثور على ملفات مطابقة في المجلد المحدد.',
      modal_files_heading: 'الملفات',
      modal_no_files_yet: 'لم يتم إضافة ملفات بعد — اضغط "+ إضافة ملفات"',
      modal_options_heading: 'خيارات التحويل',
      hint_open_file: 'انقر مرتين لفتح الملف أو المجلد',
      notify_all_completed: 'اكتملت جميع عمليات التحويل بنجاح!',
      about_ver: 'الإصدار',
      about_engine: 'محرك المعالجة',
      about_license: 'الترخيص',
      about_mit: 'مجاني بالكامل (MIT)',
      output_setting: 'إعدادات الإخراج (Output Setting)',
      video_setting_title: 'إعدادات الفيديو (Video Setting)',
      audio_setting_title: 'إعدادات الصوت (Audio Setting)',
      picture_setting_title: 'إعدادات الصورة (Picture Setting)',
      btn_save_as: 'حفظ كقالب',
      btn_default: 'الافتراضي',
      ft_tab_files: 'الملفات المحددة',
      ft_tab_preview: 'Preview (معاينة)',
      ft_tab_mediainfo: 'Media information (معلومات الوسائط)',
      th_file_info: 'الملف والمعلومات',
      th_actions: 'الخصائص والتقطيع',
      th_file_name: 'اسم الملف',
      th_size: 'الحجم',
      th_duration: 'المدة / الدقة',
      th_path: 'المسار المصدر',
      // Document & Disc Modals
      doc_btn_move_up: 'للأعلى',
      doc_btn_move_down: 'للأسفل',
      doc_th_filename: 'اسم الملف (File Name)',
      doc_th_size: 'الحجم (Size)',
      doc_th_pages: 'نطاق الصفحات (Pages)',
      doc_th_status: 'الحالة',
      doc_th_action: 'إجراء',
      doc_empty_hint: 'اسحب وأفلت الملفات هنا، أو انقر على "+ إضافة ملفات"',
      doc_pages_all: 'الكل (All)',
      st_ready: 'جاهز',
      lbl_save_folder: 'مجلد الحفظ:',
      btn_browse: 'استعراض',
      btn_open: 'فتح',
      doc_btn_confirm: 'تأكيد وإضافة للمهام',
      disc_btn_confirm: 'بدء النسخ والتحويل',
      disc_btn_refresh: 'تحديث',
      disc_lbl_drive: 'محرك الأقراص (CD/DVD Drive):',
      disc_lbl_or_iso: 'أو من مجلد قرص / ملف ISO على الجهاز:',
      disc_iso_placeholder: 'D:\\VIDEO_TS أو ملف ISO...',
      disc_lbl_disc: 'القرص:',
      disc_lbl_type: 'النوع:',
      disc_lbl_size: 'المساحة الإجمالية:',
      disc_val_standard: 'قياسي',
      disc_val_ready: 'جاهز للقراءة',
      disc_banner_default: 'سيتم قراءة وفحص بنية القرص وتحويل المحتوى لأعلى جودة مباشرة.',
      doc_banner_default: 'سيتم تحويل المستند وفق أعلى معايير الجودة والتوافق مع التطبيقات الأصلية.',
      doc_opt_autocompress: 'ضغط الملف المدمج تلقائياً بعد المعالجة (Auto-compress output)',
      doc_opt_bookmarks: 'حفظ الفهرس والإشارات المرجعية للملفات الأصلية',
      doc_lbl_compress_level: 'مستوى الضغط والجودة:',
      doc_opt_compress_balanced: 'متوازن — 150 DPI (موصى به للمشاركة والقراءة)',
      doc_opt_compress_high: 'خفيف — 300 DPI (جودة طباعة ممتازة وألوان كاملة)',
      doc_opt_compress_extreme: 'أقصى ضغط — 72 DPI (أصغر حجم ممكن لإرسال الإيميل)',
      doc_opt_del_fonts: 'إزالة الخطوط المكررة غير المستخدمة',
      doc_lbl_pic_format: 'صيغة الصورة:',
      doc_lbl_pic_dpi: 'دقة الوضوح (DPI):',
      doc_lbl_pic_mode: 'وضع الاستخراج:',
      doc_opt_mode_pages: 'كل صفحة كصورة كاملة',
      doc_opt_mode_embedded: 'الصور المضمنة فقط داخل الملف',
      doc_lbl_page_size: 'مقاس الصفحة:',
      doc_lbl_orientation: 'الاتجاه:',
      doc_opt_orient_auto: 'تلقائي حسب أبعاد الصورة',
      doc_opt_orient_portrait: 'عمودي (Portrait)',
      doc_opt_orient_landscape: 'أفقي (Landscape)',
      doc_lbl_margins: 'الهوامش:',
      doc_opt_margin_none: 'بدون هوامش (ملء الصفحة)',
      doc_opt_margin_small: 'هوامش صغيرة (10mm)',
      doc_lbl_pwd_open: 'كلمة مرور فتح الملف (Open Password):',
      doc_lbl_pwd_owner: 'كلمة مرور المدير (Owner):',
      doc_opt_perm_print: 'السماح بطباعة المستند',
      doc_opt_perm_copy: 'السماح بنسخ النصوص',
      doc_lbl_decrypt_pwd: 'كلمة المرور الحالية لفك الحماية:',
      doc_lbl_range: 'نطاق الصفحات:',
      doc_range_placeholder: 'مثال: 1-5, 8, 12 (اتركه فارغاً للكل)',
      doc_opt_ocr: 'الحفاظ التام على الجداول وتنسيق الخطوط',
      doc_lbl_zip_level: 'مستوى الضغط:',
      doc_opt_zip_normal: 'عادي (متوازن وسريع)',
      doc_opt_zip_max: 'أقصى ضغط (أصغر حجم للأرشيف)',
      doc_opt_zip_fast: 'سريع جداً',
      doc_lbl_zip_pwd: 'كلمة مرور الأرشيف (اختياري):',
      doc_zip_pwd_placeholder: 'اتركه فارغاً إذا بدون كلمة سر',
      disc_lbl_title: 'العنوان (Title):',
      disc_lbl_chapters: 'الفصول:',
      disc_lbl_from: 'من',
      disc_lbl_to: 'إلى',
      disc_lbl_audio_stream: 'مسار الصوت:',
      disc_lbl_subtitle: 'الترجمة المدمجة:',
      disc_opt_sub_none: 'بدون ترجمة (None)',
      disc_lbl_output_format: 'الصيغة الناتجة:',
      disc_opt_deinterlace: 'إزالة خطوط التشابك (Deinterlace YADIF)',
      disc_btn_fetch_cddb: '🌐 جلب معلومات الأسطوانة (Get CD Info from gnudb)',
      disc_status_cddb_ready: 'جاهز للاتصال بقاعدة بيانات الأقراص',
      disc_lbl_cd_format: 'صيغة الصوت الناتجة:',
      disc_th_track: 'المسار',
      disc_th_title: 'عنوان المقطع (Track Title)',
      disc_th_artist: 'الفنان (Artist)',
      disc_th_duration: 'المدة',
      disc_lbl_iso_target: 'صيغة الصورة الناتجة:',
      disc_lbl_cso_level: 'مستوى ضغط CSO (1-9):',
      t_disc_iso_title: 'DVD/CD إلى ISO/CSO',
      t_disc_cso_modal_title: 'ISO <--> CSO',
      t_disc_cd_title: 'أسطوانة الموسيقى إلى ملف صوتي',
      disc_cd_driver: 'قارئ الأقراص (CD Driver)',
      disc_output_setting: 'إعدادات الإخراج (Output Setting)',
      disc_high_quality: 'جودة عالية (High quality)',
      disc_rename_all: 'إعادة تسمية جميع المسارات',
      disc_get_cd_info: 'جلب معلومات الأسطوانة',
      disc_compress_level: 'مستوى الضغط',
      disc_btn_change: 'تغيير',
      disc_btn_convert: 'تحويل',
      disc_ripper_mod_prompt: 'يجب تثبيت DVDRipper MOD. اضغط "Yes" للتثبيت.',
      btn_yes: 'نعم',
      btn_no: 'لا',
    },
    en: {
      dir: 'ltr',
      app_title: 'FormaLux — Ultimate Media Converter Suite',
      menu_task: 'Task',
      menu_theme: 'Theme',
      menu_language: 'Language',
      menu_options: 'Options',
      menu_help: 'Help',
      menu_start: 'Start Conversion',
      menu_stop: 'Pause / Stop',
      menu_remove: 'Remove Selected',
      menu_clear: 'Clear All Tasks',
      menu_output_folder: 'Open Output Folder',
      menu_exit: 'Exit',
      theme_nebula: 'Nebula Deep Dark (Default)',
      theme_oled: 'OLED Midnight Black',
      theme_cyber: 'Cyberpunk Neon Glow',
      theme_emerald: 'Royal Emerald Green',
      theme_light: 'Classic Light Luxury',
      menu_settings: 'Preferences & Settings',
      menu_ha_test: 'Hardware Acceleration Test',
      menu_reset_defaults: 'Reset to Defaults',
      menu_homepage: 'Official Homepage',
      menu_check_updates: 'Check for Updates',
      menu_changelog: 'Changelog & Release Notes',
      menu_about: 'About FormaLux',
      tb_output_folder: 'Output Folder',
      tb_options: 'Options',
      tb_remove: 'Remove',
      tb_clear: 'Clear List',
      tb_stop: 'Stop',
      tb_start: 'Start',
      cat_video: 'Video',
      cat_audio: 'Audio',
      cat_image: 'Picture',
      cat_document: 'Document',
      cat_disc: 'ROM / Disc',
      cat_tools: 'Utilities',
      col_preview: 'Preview',
      col_source: 'Source',
      col_output: 'Output / Status',
      empty_title: 'Drag files here or choose a tool from the left',
      empty_subtitle: 'Ready to convert your media at lightning speed',
      status_multithread: 'Use Multi-Threads',
      status_shutdown: 'After conversion: Shut down PC',
      status_notify: 'Notification on complete',
      status_elapsed: 'Elapsed Time',
      modal_options_title: 'Options',
      tab_general: 'General Options',
      tab_advanced: 'Advanced',
      grp_output: 'Output Folder',
      btn_change: 'Change',
      opt_same_folder: 'Output to same folder as source',
      opt_sub_folder: 'Create FormaLux subfolder',
      grp_post: 'After Conversion',
      opt_shutdown: 'Shutdown computer after tasks complete',
      opt_open_folder: 'Open output folder automatically',
      grp_sound: 'Sound Alerts',
      opt_sound_general: 'General UI sound effects',
      opt_sound_complete: 'Play sound when conversion succeeds',
      opt_sound_fail: 'Play sound when conversion fails',
      grp_system: 'System Integration',
      opt_context_menu: 'Add to Windows context menu',
      opt_check_updates: 'Check updates automatically',
      opt_minimize_tray: 'Minimize to system tray',
      grp_gpu: 'GPU Hardware Acceleration',
      opt_gpu_auto: 'Auto-detect GPU acceleration',
      btn_ha_test: 'HA Test',
      opt_gpu_desc: 'Supports NVIDIA (NVENC), Intel (QuickSync), and AMD (AMF).',
      grp_cpu: 'CPU Multi-Threading',
      opt_threads: 'Enable multi-threading',
      opt_show_usage: 'Show CPU usage in status bar',
      grp_img_quality: 'Image Output Quality',
      btn_cancel: 'Cancel',
      btn_apply: 'Apply',
      btn_ok: 'OK',
      btn_add_files: 'Add Files',
      btn_add_folder: '+ Add Folder',
      btn_add_music: '+ Add Music',
      btn_confirm: 'Confirm & Add to Queue',
      about_tagline: 'The ultimate professional converter for Video, Audio, Images & Documents',
      st_queued: 'Queued',
      st_converting: 'Converting...',
      st_completed: 'Completed ✓',
      st_failed: 'Failed ✗',
      st_cancelled: 'Cancelled',
      alert_updates_latest: 'You are running the latest version of FormaLux (v1.0.0)',
      alert_reset_done: 'Settings have been reset to defaults',
      alert_no_files: 'Please add at least one file to proceed',
      // Tools Translations
      t_v_merge: 'Video Joiner & Muxer',
      t_v_enhance: 'Enhance & Compress',
      t_v_separate: 'Audio/Video Separator',
      t_v_crop: 'Crop Video Frame',
      t_v_clip: 'Quick Clip & Trim',
      t_v_delogo: 'Remove Watermark',
      t_v_frames: 'Export Frames',
      t_v_record: 'Screen Recorder',
      t_v_player: 'Media Player',
      t_v_download: 'Video Downloader',
      t_a_merge: 'Audio Joiner',
      t_a_split: 'Audio Splitter',
      t_a_extract: 'Extract Audio',
      t_a_mix: 'Audio Mixer',
      t_a_tts: 'Text to Speech (TTS)',
      t_d_pdf_join: 'PDF Joiner',
      t_d_compress: 'Compress PDF',
      t_d_pic_pdf: 'Images to PDF',
      t_d_pdf_pic: 'PDF to Images',
      t_d_pdf_text: 'PDF to Text',
      t_d_pdf_docx: 'PDF to Word (DOCX)',
      t_d_pdf_excel: 'PDF to Excel',
      t_d_docx_pdf: 'Word to PDF',
      t_d_decrypt: 'Decrypt PDF (Unlock)',
      t_d_encrypt: 'Encrypt PDF (Protect)',
      t_d_zip: 'FFZip Archive',
      t_disc_bluray: 'Blu-ray to MKV',
      t_disc_dvd: 'DVD to Video',
      t_disc_cd: 'Audio CD Ripper',
      t_disc_iso: 'DVD/CD to ISO/CSO',
      t_disc_cso: 'ISO ↔ CSO Converter',
      t_util_info: 'MediaInfo Inspector',
      t_util_rename: 'Batch File Renamer',
      t_util_ha: 'Hardware Acceleration Test',
      t_media_info_title: 'Media File Info',
      btn_copy_clipboard: 'Copy to clipboard',
      copied_to_clipboard: 'Copied!',
      t_rename_title: 'Rename',
      lbl_file_type: 'File Type',
      lbl_entire_tree: 'Entire Tree',
      lbl_format_group: 'Format',
      lbl_pattern: 'Format',
      lbl_delimiter: 'Delimiter',
      lbl_start_number: 'Number',
      lbl_date_group: 'Date',
      lbl_date_format: 'Date',
      lbl_time_format: 'Time',
      lbl_file_date: 'File Date',
      lbl_current_date: 'Current Date',
      lbl_photo_date: 'Photo Date',
      lbl_remove_group: 'Remove',
      lbl_remove_string: 'Remove String',
      lbl_ignore_datetime: 'Ignore date and time characters',
      btn_rename_action: 'Rename',
      t_ha_test_title: 'Hardware Acceleration Testing',
      ha_probing: 'Testing hardware acceleration...',
      rename_success: 'Successfully renamed {count} files!',
      rename_no_files: 'No matching files found in the selected folder.',
      modal_files_heading: 'Files',
      modal_no_files_yet: 'No files added yet — click "+ Add Files"',
      modal_options_heading: 'Conversion Settings',
      hint_open_file: 'Double-click to open file or folder',
      notify_all_completed: 'All conversion tasks completed successfully!',
      about_ver: 'Version',
      about_engine: 'Core Engine',
      about_license: 'License',
      about_mit: 'Free & Open Source (MIT)',
      output_setting: 'Output Setting',
      video_setting_title: 'Video Setting',
      audio_setting_title: 'Audio Setting',
      picture_setting_title: 'Picture Setting',
      btn_save_as: 'Save As',
      btn_default: 'Default',
      ft_tab_files: 'Selected Files',
      ft_tab_preview: 'Preview',
      ft_tab_mediainfo: 'Media information',
      th_file_info: 'File & Media Info',
      th_actions: 'Option & Divide',
      th_file_name: 'File Name',
      th_size: 'Size',
      th_duration: 'Duration / Res',
      th_path: 'Source Path',
      // Document & Disc Modals
      doc_btn_move_up: 'Move Up',
      doc_btn_move_down: 'Move Down',
      doc_th_filename: 'File Name',
      doc_th_size: 'Size',
      doc_th_pages: 'Page Range',
      doc_th_status: 'Status',
      doc_th_action: 'Action',
      doc_empty_hint: 'Drag files here or choose a tool from the left',
      doc_pages_all: 'All',
      st_ready: 'Ready',
      lbl_save_folder: 'Save Folder:',
      btn_browse: 'Browse',
      btn_open: 'Open',
      doc_btn_confirm: 'Confirm & Add to Queue',
      disc_btn_confirm: 'Start Rip & Convert',
      disc_btn_refresh: 'Refresh',
      disc_lbl_drive: 'CD/DVD Drive:',
      disc_lbl_or_iso: 'Or from disc folder / ISO file on PC:',
      disc_iso_placeholder: 'D:\\VIDEO_TS or ISO file...',
      disc_lbl_disc: 'Disc:',
      disc_lbl_type: 'Type:',
      disc_lbl_size: 'Total Size:',
      disc_val_standard: 'Standard',
      disc_val_ready: 'Ready to Read',
      disc_banner_default: 'Disc structure will be scanned and converted at maximum quality.',
      doc_banner_default: 'Document will be processed with native formatting and high fidelity.',
      doc_opt_autocompress: 'Auto-compress merged output file after processing',
      doc_opt_bookmarks: 'Preserve outlines, table of contents and bookmarks',
      doc_lbl_compress_level: 'Compression Level & Quality:',
      doc_opt_compress_balanced: 'Balanced — 150 DPI (Recommended for sharing & reading)',
      doc_opt_compress_high: 'High Quality — 300 DPI (Excellent print quality & full color)',
      doc_opt_compress_extreme: 'Max Compression — 72 DPI (Smallest size for email attachments)',
      doc_opt_del_fonts: 'Remove unused duplicate fonts and redundant streams',
      doc_lbl_pic_format: 'Image Format:',
      doc_lbl_pic_dpi: 'Resolution (DPI):',
      doc_lbl_pic_mode: 'Extraction Mode:',
      doc_opt_mode_pages: 'Each page as full image',
      doc_opt_mode_embedded: 'Embedded images only',
      doc_lbl_page_size: 'Page Size:',
      doc_lbl_orientation: 'Orientation:',
      doc_opt_orient_auto: 'Auto (match image aspect)',
      doc_opt_orient_portrait: 'Portrait',
      doc_opt_orient_landscape: 'Landscape',
      doc_lbl_margins: 'Margins:',
      doc_opt_margin_none: 'No margins (fill page)',
      doc_opt_margin_small: 'Small margins (10mm)',
      doc_lbl_pwd_open: 'Document Open Password:',
      doc_lbl_pwd_owner: 'Permissions / Owner Password:',
      doc_opt_perm_print: 'Allow document printing',
      doc_opt_perm_copy: 'Allow text and graphic copying',
      doc_lbl_decrypt_pwd: 'Current Password to Unlock:',
      doc_lbl_range: 'Page Range:',
      doc_range_placeholder: 'e.g. 1-5, 8, 12 (leave empty for all)',
      doc_opt_ocr: 'Preserve tables, styles and document formatting',
      doc_lbl_zip_level: 'Compression Level:',
      doc_opt_zip_normal: 'Normal (balanced & fast)',
      doc_opt_zip_max: 'Maximum (smallest archive size)',
      doc_opt_zip_fast: 'Ultra Fast',
      doc_lbl_zip_pwd: 'Archive Password (optional):',
      doc_zip_pwd_placeholder: 'Leave empty for no password',
      disc_lbl_title: 'Title:',
      disc_lbl_chapters: 'Chapters:',
      disc_lbl_from: 'From',
      disc_lbl_to: 'To',
      disc_lbl_audio_stream: 'Audio Stream:',
      disc_lbl_subtitle: 'Subtitle Track:',
      disc_opt_sub_none: 'None (No subtitles)',
      disc_lbl_output_format: 'Output Container:',
      disc_opt_deinterlace: 'Deinterlace video (YADIF filter)',
      disc_btn_fetch_cddb: '🌐 Fetch CD Info (gnudb.org)',
      disc_status_cddb_ready: 'Ready to connect to disc database',
      disc_lbl_cd_format: 'Audio Output Format:',
      disc_th_track: 'Track',
      disc_th_title: 'Track Title',
      disc_th_artist: 'Artist',
      disc_th_duration: 'Duration',
      disc_lbl_iso_target: 'Target Disc Image:',
      disc_lbl_cso_level: 'CSO Compression Level (1-9):',
      t_disc_iso_title: 'DVD/CD to ISO/CSO',
      t_disc_cso_modal_title: 'ISO <--> CSO',
      t_disc_cd_title: 'Music CD to Audio File',
      disc_cd_driver: 'CD Driver',
      disc_output_setting: 'Output Setting',
      disc_high_quality: 'High quality',
      disc_rename_all: 'Rename all tracks',
      disc_get_cd_info: 'Get CD Info',
      disc_compress_level: 'Compress Level',
      disc_btn_change: 'Change',
      disc_btn_convert: 'Convert',
      disc_ripper_mod_prompt: 'You must install DVDRipper MOD. Click "Yes" to install.',
      btn_yes: 'Yes',
      btn_no: 'No',
    },
    fr: {
      dir: 'ltr',
      app_title: 'FormaLux — Convertisseur Multimédia Professionnel',
      menu_task: 'Tâche',
      menu_theme: 'Thème',
      menu_language: 'Langue',
      menu_options: 'Options',
      menu_help: 'Aide',
      menu_start: 'Démarrer la conversion',
      menu_stop: 'Arrêter / Pause',
      menu_remove: 'Supprimer la sélection',
      menu_clear: 'Effacer la liste',
      menu_output_folder: 'Dossier de sortie',
      menu_exit: 'Quitter',
      theme_nebula: 'Nébuleuse Sombre (Défaut)',
      theme_oled: 'OLED Noir Absolu',
      theme_cyber: 'Cyberpunk Néon',
      theme_emerald: 'Émeraude Royale',
      theme_light: 'Clair Classique',
      menu_settings: 'Préférences',
      menu_ha_test: 'Test Accélération GPU',
      menu_reset_defaults: 'Réinitialiser',
      menu_homepage: 'Site Officiel',
      menu_check_updates: 'Mises à jour',
      menu_changelog: 'Historique',
      menu_about: 'À propos de FormaLux',
      tb_output_folder: 'Dossier de sortie',
      tb_options: 'Options',
      tb_remove: 'Supprimer',
      tb_clear: 'Vider',
      tb_stop: 'Arrêter',
      tb_start: 'Démarrer',
      cat_video: 'Vidéo',
      cat_audio: 'Audio',
      cat_image: 'Image',
      cat_document: 'Document',
      cat_disc: 'Disque / ROM',
      cat_tools: 'Utilitaires',
      col_preview: 'Aperçu',
      col_source: 'Source',
      col_output: 'Sortie / État',
      empty_title: 'Glissez les fichiers ici ou choisissez un outil',
      empty_subtitle: 'Prêt à convertir vos médias',
      status_multithread: 'Multi-Threads',
      status_shutdown: 'Éteindre le PC après',
      status_notify: 'Notification de fin',
      status_elapsed: 'Temps écoulé',
      modal_options_title: 'Options',
      tab_general: 'Général',
      tab_advanced: 'Avancé',
      btn_cancel: 'Annuler',
      btn_apply: 'Appliquer',
      btn_ok: 'Valider',
      btn_add_files: 'Ajouter des fichiers',
      btn_add_folder: '+ Ajouter dossier',
      btn_add_music: '+ Ajouter musique',
      btn_confirm: 'Ajouter à la file',
      about_tagline: 'Convertisseur professionnel tout-en-un',
      st_queued: 'En attente',
      st_converting: 'Conversion...',
      st_completed: 'Terminé ✓',
      st_failed: 'Échec ✗',
      st_cancelled: 'Annulé',
      alert_updates_latest: 'Vous utilisez la dernière version de FormaLux (v1.0.0)',
      alert_reset_done: 'Paramètres réinitialisés avec succès',
      alert_no_files: 'Veuillez ajouter au moins un fichier',
      // Tools Translations
      t_v_merge: 'Fusionner & Muxer',
      t_v_enhance: 'Améliorer & Compresser',
      t_v_separate: 'Séparateur Audio/Vidéo',
      t_v_crop: 'Recadrer la vidéo',
      t_v_clip: 'Découpage Rapide',
      t_v_delogo: 'Supprimer Filigrane',
      t_v_frames: 'Exporter les images',
      t_v_record: 'Enregistreur d\'écran',
      t_v_player: 'Lecteur Multimédia',
      t_v_download: 'Téléchargeur de Vidéos',
      t_a_merge: 'Fusionneur Audio',
      t_a_split: 'Découpeur Audio',
      t_a_extract: 'Extraire l\'audio',
      t_a_mix: 'Mixeur Audio',
      t_a_tts: 'Texte en Parole (TTS)',
      t_d_pdf_join: 'Fusionner PDF',
      t_d_compress: 'Compresser PDF',
      t_d_pic_pdf: 'Images en PDF',
      t_d_pdf_pic: 'PDF en Images',
      t_d_pdf_text: 'PDF en Texte',
      t_d_pdf_docx: 'PDF en Word (DOCX)',
      t_d_pdf_excel: 'PDF en Excel',
      t_d_docx_pdf: 'Word en PDF',
      t_d_decrypt: 'Déverrouiller PDF',
      t_d_encrypt: 'Protéger PDF',
      t_d_zip: 'Archive FFZip',
      t_disc_bluray: 'Blu-ray en MKV',
      t_disc_dvd: 'DVD en Vidéo',
      t_disc_cd: 'CD Audio en Musique',
      t_disc_iso: 'DVD/CD en ISO/CSO',
      t_disc_cso: 'Convertisseur ISO ↔ CSO',
      t_util_info: 'Infos Média',
      t_util_rename: 'Renommage par lot',
      t_util_ha: 'Test Accélération GPU',
      t_media_info_title: 'Infos Fichier Média',
      btn_copy_clipboard: 'Copier dans le presse-papiers',
      copied_to_clipboard: 'Copié !',
      t_rename_title: 'Renommer',
      lbl_file_type: 'Type de fichier',
      lbl_entire_tree: 'Toute l\'arborescence',
      lbl_format_group: 'Format',
      lbl_pattern: 'Format',
      lbl_delimiter: 'Délimiteur',
      lbl_start_number: 'Numéro',
      lbl_date_group: 'Date',
      lbl_date_format: 'Date',
      lbl_time_format: 'Heure',
      lbl_file_date: 'Date du fichier',
      lbl_current_date: 'Date actuelle',
      lbl_photo_date: 'Date de la photo',
      lbl_remove_group: 'Supprimer',
      lbl_remove_string: 'Chaîne à supprimer',
      lbl_ignore_datetime: 'Ignorer les caractères de date et heure',
      btn_rename_action: 'Renommer',
      t_ha_test_title: 'Hardware Acceleration Testing',
      ha_probing: 'Test de l\'accélération matérielle...',
      rename_success: '{count} fichiers renommés avec succès !',
      rename_no_files: 'Aucun fichier correspondant trouvé dans le dossier.',
      modal_files_heading: 'Fichiers',
      modal_no_files_yet: 'Aucun fichier ajouté — cliquez sur "+ Ajouter des fichiers"',
      modal_options_heading: 'Paramètres de conversion',
      hint_open_file: 'Double-cliquez pour ouvrir le fichier ou dossier',
      notify_all_completed: 'Toutes les conversions sont terminées avec succès !',
      about_ver: 'Version',
      about_engine: 'Moteur de traitement',
      about_license: 'Licence',
      about_mit: 'Gratuit & Open Source (MIT)',
      output_setting: 'Paramètres de sortie',
      video_setting_title: 'Paramètres Vidéo',
      audio_setting_title: 'Paramètres Audio',
      picture_setting_title: 'Paramètres Image',
      btn_save_as: 'Enregistrer sous',
      btn_default: 'Par défaut',
      ft_tab_files: 'Fichiers sélectionnés',
      ft_tab_preview: 'Aperçu',
      ft_tab_mediainfo: 'Informations média',
      th_file_name: 'Nom du fichier',
      th_size: 'Taille',
      th_duration: 'Durée / Résolution',
      th_path: 'Chemin source',
      // Document & Disc Modals
      doc_btn_move_up: 'Monter',
      doc_btn_move_down: 'Descendre',
      doc_th_filename: 'Nom du fichier',
      doc_th_size: 'Taille',
      doc_th_pages: 'Plage de pages',
      doc_th_status: 'État',
      doc_th_action: 'Action',
      doc_empty_hint: 'Glissez les fichiers ici ou choisissez un outil à gauche',
      doc_pages_all: 'Toutes',
      st_ready: 'Prêt',
      lbl_save_folder: 'Dossier d\'enregistrement :',
      btn_browse: 'Parcourir',
      btn_open: 'Ouvrir',
      doc_btn_confirm: 'Confirmer et ajouter',
      disc_btn_confirm: 'Démarrer l\'extraction',
      disc_btn_refresh: 'Actualiser',
      disc_lbl_drive: 'Lecteur CD/DVD :',
      disc_lbl_or_iso: 'Ou depuis un dossier / fichier ISO sur le PC :',
      disc_iso_placeholder: 'D:\\VIDEO_TS ou fichier ISO...',
      disc_lbl_disc: 'Disque :',
      disc_lbl_type: 'Type :',
      disc_lbl_size: 'Taille totale :',
      disc_val_standard: 'Standard',
      disc_val_ready: 'Prêt pour la lecture',
      disc_banner_default: 'La structure du disque sera analysée et convertie en haute qualité.',
      doc_banner_default: 'Le document sera traité avec fidélité et conformité maximale.',
      doc_opt_autocompress: 'Compresser automatiquement le fichier fusionné après traitement',
      doc_opt_bookmarks: 'Conserver les signets et la table des matières d\'origine',
      doc_lbl_compress_level: 'Niveau de compression et qualité :',
      doc_opt_compress_balanced: 'Équilibré — 150 DPI (Recommandé pour lecture et partage)',
      doc_opt_compress_high: 'Haute qualité — 300 DPI (Qualité d\'impression supérieure)',
      doc_opt_compress_extreme: 'Compression maximale — 72 DPI (Taille minimale pour e-mails)',
      doc_opt_del_fonts: 'Supprimer les polices en double inutilisées',
      doc_lbl_pic_format: 'Format d\'image :',
      doc_lbl_pic_dpi: 'Résolution (DPI) :',
      doc_lbl_pic_mode: 'Mode d\'extraction :',
      doc_opt_mode_pages: 'Chaque page en image complète',
      doc_opt_mode_embedded: 'Images incorporées uniquement',
      doc_lbl_page_size: 'Format de page :',
      doc_lbl_orientation: 'Orientation :',
      doc_opt_orient_auto: 'Automatique (selon l\'image)',
      doc_opt_orient_portrait: 'Portrait',
      doc_opt_orient_landscape: 'Paysage',
      doc_lbl_margins: 'Marges :',
      doc_opt_margin_none: 'Sans marge (pleine page)',
      doc_opt_margin_small: 'Petites marges (10mm)',
      doc_lbl_pwd_open: 'Mot de passe d\'ouverture :',
      doc_lbl_pwd_owner: 'Mot de passe administrateur (Permissions) :',
      doc_opt_perm_print: 'Autoriser l\'impression',
      doc_opt_perm_copy: 'Autoriser la copie de texte',
      doc_lbl_decrypt_pwd: 'Mot de passe actuel pour déverrouiller :',
      doc_lbl_range: 'Plage de pages :',
      doc_range_placeholder: 'ex. 1-5, 8, 12 (laisser vide pour tout)',
      doc_opt_ocr: 'Conserver les tableaux et la mise en page exacte',
      doc_lbl_zip_level: 'Niveau de compression :',
      doc_opt_zip_normal: 'Normal (équilibré et rapide)',
      doc_opt_zip_max: 'Maximum (taille minimale)',
      doc_opt_zip_fast: 'Très rapide',
      doc_lbl_zip_pwd: 'Mot de passe d\'archive (facultatif) :',
      doc_zip_pwd_placeholder: 'Laisser vide si aucun mot de passe',
      disc_lbl_title: 'Titre :',
      disc_lbl_chapters: 'Chapitres :',
      disc_lbl_from: 'De',
      disc_lbl_to: 'À',
      disc_lbl_audio_stream: 'Piste Audio :',
      disc_lbl_subtitle: 'Sous-titres :',
      disc_opt_sub_none: 'Aucun sous-titre',
      disc_lbl_output_format: 'Format de sortie :',
      disc_opt_deinterlace: 'Désentrelacer la vidéo (YADIF)',
      disc_btn_fetch_cddb: '🌐 Obtenir les infos du CD (gnudb)',
      disc_status_cddb_ready: 'Prêt à interroger la base de données',
      disc_lbl_cd_format: 'Format audio de sortie :',
      disc_th_track: 'Piste',
      disc_th_title: 'Titre de la piste',
      disc_th_artist: 'Artiste',
      disc_th_duration: 'Durée',
      disc_lbl_iso_target: 'Format d\'image cible :',
      disc_lbl_cso_level: 'Niveau de compression CSO (1-9) :',
      t_disc_iso_title: 'DVD/CD vers ISO/CSO',
      t_disc_cso_modal_title: 'ISO <--> CSO',
      t_disc_cd_title: 'CD Audio en fichier audio',
      disc_cd_driver: 'Lecteur CD',
      disc_output_setting: 'Paramètres de sortie',
      disc_high_quality: 'Haute qualité',
      disc_rename_all: 'Renommer toutes les pistes',
      disc_get_cd_info: 'Obtenir infos CD',
      disc_compress_level: 'Niveau de compression',
      disc_btn_change: 'Modifier',
      disc_btn_convert: 'Convertir',
      disc_ripper_mod_prompt: 'Vous devez installer DVDRipper MOD. Cliquez sur "Yes" pour installer.',
      btn_yes: 'Oui',
      btn_no: 'Non',
    },
    es: {
      dir: 'ltr',
      app_title: 'FormaLux — Suite de Conversión Profesional',
      menu_task: 'Tarea',
      menu_theme: 'Tema',
      menu_language: 'Idioma',
      menu_options: 'Opciones',
      menu_help: 'Ayuda',
      menu_start: 'Iniciar conversión',
      menu_stop: 'Pausar / Detener',
      menu_remove: 'Eliminar seleccionado',
      menu_clear: 'Vaciar lista',
      menu_output_folder: 'Carpeta de salida',
      menu_exit: 'Salir',
      theme_nebula: 'Nebulosa Oscura (Defecto)',
      theme_oled: 'OLED Negro Puro',
      theme_cyber: 'Cyberpunk Neón',
      theme_emerald: 'Esmeralda Real',
      theme_light: 'Clásico Claro',
      menu_settings: 'Configuración',
      menu_ha_test: 'Test Aceleración GPU',
      menu_reset_defaults: 'Restablecer',
      menu_homepage: 'Sitio Oficial',
      menu_check_updates: 'Buscar actualizaciones',
      menu_changelog: 'Registro de cambios',
      menu_about: 'Acerca de FormaLux',
      tb_output_folder: 'Carpeta de salida',
      tb_options: 'Opciones',
      tb_remove: 'Eliminar',
      tb_clear: 'Limpiar',
      tb_stop: 'Detener',
      tb_start: 'Iniciar',
      cat_video: 'Vídeo',
      cat_audio: 'Audio',
      cat_image: 'Imagen',
      cat_document: 'Documento',
      cat_disc: 'Disco / ROM',
      cat_tools: 'Utilidades',
      col_preview: 'Vista previa',
      col_source: 'Origen',
      col_output: 'Salida / Estado',
      empty_title: 'Arrastre archivos aquí o seleccione una herramienta',
      empty_subtitle: 'Listo para convertir sus medios a máxima velocidad',
      status_multithread: 'Multihilo',
      status_shutdown: 'Apagar PC al finalizar',
      status_notify: 'Notificar al completar',
      status_elapsed: 'Tiempo transcurrido',
      modal_options_title: 'Opciones',
      tab_general: 'General',
      tab_advanced: 'Avanzado',
      btn_cancel: 'Cancelar',
      btn_apply: 'Aplicar',
      btn_ok: 'Aceptar',
      btn_add_files: 'Añadir archivos',
      btn_add_folder: '+ Añadir carpeta',
      btn_add_music: '+ Añadir música',
      btn_confirm: 'Confirmar y añadir a cola',
      about_tagline: 'Suite de conversión multimedia profesional',
      st_queued: 'En cola',
      st_converting: 'Convirtiendo...',
      st_completed: 'Completado ✓',
      st_failed: 'Fallido ✗',
      st_cancelled: 'Cancelado',
      alert_updates_latest: 'Tiene instalada la versión más reciente (v1.0.0)',
      alert_reset_done: 'Ajustes restaurados correctamente',
      alert_no_files: 'Por favor, añada al menos un archivo',
      // Tools Translations
      t_v_merge: 'Unir Vídeo & Mux',
      t_v_enhance: 'Mejorar y Comprimir',
      t_v_separate: 'Separador Audio/Vídeo',
      t_v_crop: 'Recortar encuadre',
      t_v_clip: 'Recorte Rápido',
      t_v_delogo: 'Eliminar Marca de Agua',
      t_v_frames: 'Exportar Fotogramas',
      t_v_record: 'Grabador de Pantalla',
      t_v_player: 'Reproductor Multimedia',
      t_v_download: 'Descargador de Vídeos',
      t_a_merge: 'Unir Pistas de Audio',
      t_a_split: 'Dividir Audio',
      t_a_extract: 'Extraer Audio',
      t_a_mix: 'Mezclador de Audio',
      t_a_tts: 'Texto a Voz (TTS)',
      t_d_pdf_join: 'Unir PDF',
      t_d_compress: 'Comprimir PDF',
      t_d_pic_pdf: 'Imágenes a PDF',
      t_d_pdf_pic: 'PDF a Imágenes',
      t_d_pdf_text: 'PDF a Texto',
      t_d_pdf_docx: 'PDF a Word (DOCX)',
      t_d_pdf_excel: 'PDF a Excel',
      t_d_docx_pdf: 'Word a PDF',
      t_d_decrypt: 'Descifrar PDF',
      t_d_encrypt: 'Cifrar PDF',
      t_d_zip: 'Archivo FFZip',
      t_disc_bluray: 'Blu-ray a MKV',
      t_disc_dvd: 'DVD a Vídeo',
      t_disc_cd: 'CD de Audio a Música',
      t_disc_iso: 'DVD/CD a ISO/CSO',
      t_disc_cso: 'Convertidor ISO ↔ CSO',
      t_util_info: 'Información del Medio',
      t_util_rename: 'Renombrado por Lotes',
      t_util_ha: 'Prueba de Aceleración GPU',
      t_media_info_title: 'Información del Archivo',
      btn_copy_clipboard: 'Copiar al portapapeles',
      copied_to_clipboard: '¡Copiado!',
      t_rename_title: 'Renombrar',
      lbl_file_type: 'Tipo de archivo',
      lbl_entire_tree: 'Árbol completo',
      lbl_format_group: 'Formato',
      lbl_pattern: 'Formato',
      lbl_delimiter: 'Delimitador',
      lbl_start_number: 'Número',
      lbl_date_group: 'Fecha',
      lbl_date_format: 'Fecha',
      lbl_time_format: 'Hora',
      lbl_file_date: 'Fecha del archivo',
      lbl_current_date: 'Fecha actual',
      lbl_photo_date: 'Fecha de la foto',
      lbl_remove_group: 'Eliminar',
      lbl_remove_string: 'Cadena a eliminar',
      lbl_ignore_datetime: 'Ignorar caracteres de fecha y hora',
      btn_rename_action: 'Renombrar',
      t_ha_test_title: 'Hardware Acceleration Testing',
      ha_probing: 'Comprobando aceleración por hardware...',
      rename_success: '¡Se renombraron {count} archivos con éxito!',
      rename_no_files: 'No se encontraron archivos coincidentes en la carpeta.',
      modal_files_heading: 'Archivos',
      modal_no_files_yet: 'No hay archivos añadidos — pulse "+ Añadir archivos"',
      modal_options_heading: 'Ajustes de conversión',
      hint_open_file: 'Doble clic para abrir el archivo o carpeta',
      notify_all_completed: '¡Todas las conversiones se completaron con éxito!',
      about_ver: 'Versión',
      about_engine: 'Motor de procesamiento',
      about_license: 'Licencia',
      about_mit: 'Gratuito y Código Abierto (MIT)',
      output_setting: 'Ajustes de salida',
      video_setting_title: 'Ajustes de Vídeo',
      audio_setting_title: 'Ajustes de Audio',
      picture_setting_title: 'Ajustes de Imagen',
      btn_save_as: 'Guardar como',
      btn_default: 'Predeterminado',
      ft_tab_files: 'Archivos seleccionados',
      ft_tab_preview: 'Vista previa',
      ft_tab_mediainfo: 'Información de medios',
      th_file_name: 'Nombre de archivo',
      th_size: 'Tamaño',
      th_duration: 'Duración / Resolución',
      th_path: 'Ruta de origen',
      // Document & Disc Modals
      doc_btn_move_up: 'Subir',
      doc_btn_move_down: 'Bajar',
      doc_th_filename: 'Nombre del archivo',
      doc_th_size: 'Tamaño',
      doc_th_pages: 'Rango de páginas',
      doc_th_status: 'Estado',
      doc_th_action: 'Acción',
      doc_empty_hint: 'Arrastre archivos aquí o seleccione una herramienta a la izquierda',
      doc_pages_all: 'Todas',
      st_ready: 'Listo',
      lbl_save_folder: 'Carpeta de destino:',
      btn_browse: 'Examinar',
      btn_open: 'Abrir',
      doc_btn_confirm: 'Confirmar y añadir',
      disc_btn_confirm: 'Iniciar copia y conversión',
      disc_btn_refresh: 'Actualizar',
      disc_lbl_drive: 'Unidad CD/DVD:',
      disc_lbl_or_iso: 'O desde carpeta de disco / archivo ISO en el equipo:',
      disc_iso_placeholder: 'D:\\VIDEO_TS o archivo ISO...',
      disc_lbl_disc: 'Disco:',
      disc_lbl_type: 'Tipo:',
      disc_lbl_size: 'Tamaño total:',
      disc_val_standard: 'Estándar',
      disc_val_ready: 'Listo para leer',
      disc_banner_default: 'La estructura del disco se analizará y convertirá con máxima calidad.',
      doc_banner_default: 'El documento se procesará con máxima calidad y compatibilidad nativa.',
      doc_opt_autocompress: 'Comprimir automáticamente el archivo fusionado tras procesar',
      doc_opt_bookmarks: 'Conservar índices y marcadores de los archivos de origen',
      doc_lbl_compress_level: 'Nivel de compresión y calidad:',
      doc_opt_compress_balanced: 'Equilibrado — 150 DPI (Recomendado para lectura y compartir)',
      doc_opt_compress_high: 'Alta calidad — 300 DPI (Excelente para impresión y color)',
      doc_opt_compress_extreme: 'Máxima compresión — 72 DPI (Tamaño más reducido para e-mail)',
      doc_opt_del_fonts: 'Eliminar fuentes duplicadas no utilizadas',
      doc_lbl_pic_format: 'Formato de imagen:',
      doc_lbl_pic_dpi: 'Resolución (DPI):',
      doc_lbl_pic_mode: 'Modo de extracción:',
      doc_opt_mode_pages: 'Cada página como imagen completa',
      doc_opt_mode_embedded: 'Solo imágenes incrustadas',
      doc_lbl_page_size: 'Tamaño de página:',
      doc_lbl_orientation: 'Orientación:',
      doc_opt_orient_auto: 'Automático según proporciones',
      doc_opt_orient_portrait: 'Vertical (Portrait)',
      doc_opt_orient_landscape: 'Horizontal (Landscape)',
      doc_lbl_margins: 'Márgenes:',
      doc_opt_margin_none: 'Sin márgenes (página completa)',
      doc_opt_margin_small: 'Márgenes pequeños (10mm)',
      doc_lbl_pwd_open: 'Contraseña de apertura:',
      doc_lbl_pwd_owner: 'Contraseña de propietario / permisos:',
      doc_opt_perm_print: 'Permitir impresión del documento',
      doc_opt_perm_copy: 'Permitir copiar texto y contenido',
      doc_lbl_decrypt_pwd: 'Contraseña actual para desbloquear:',
      doc_lbl_range: 'Rango de páginas:',
      doc_range_placeholder: 'ej. 1-5, 8, 12 (dejar vacío para todas)',
      doc_opt_ocr: 'Preservar tablas, estilos y diseño de página',
      doc_lbl_zip_level: 'Nivel de compresión:',
      doc_opt_zip_normal: 'Normal (equilibrado y rápido)',
      doc_opt_zip_max: 'Máximo (menor tamaño)',
      doc_opt_zip_fast: 'Muy rápido',
      doc_lbl_zip_pwd: 'Contraseña de archivo (opcional):',
      doc_zip_pwd_placeholder: 'Dejar vacío si no requiere contraseña',
      disc_lbl_title: 'Título:',
      disc_lbl_chapters: 'Capítulos:',
      disc_lbl_from: 'Desde',
      disc_lbl_to: 'Hasta',
      disc_lbl_audio_stream: 'Pista de Audio:',
      disc_lbl_subtitle: 'Subtítulos:',
      disc_opt_sub_none: 'Ninguno (Sin subtítulos)',
      disc_lbl_output_format: 'Formato de salida:',
      disc_opt_deinterlace: 'Desentrelazado de vídeo (YADIF)',
      disc_btn_fetch_cddb: '🌐 Obtener información de CD (gnudb)',
      disc_status_cddb_ready: 'Listo para conectar con base de datos de discos',
      disc_lbl_cd_format: 'Formato de audio resultante:',
      disc_th_track: 'Pista',
      disc_th_title: 'Título de la pista',
      disc_th_artist: 'Artista',
      disc_th_duration: 'Duración',
      disc_lbl_iso_target: 'Formato de imagen destino:',
      disc_lbl_cso_level: 'Nivel de compresión CSO (1-9):',
      t_disc_iso_title: 'DVD/CD a ISO/CSO',
      t_disc_cso_modal_title: 'ISO <--> CSO',
      t_disc_cd_title: 'CD de música a archivo de audio',
      disc_cd_driver: 'Controlador de CD',
      disc_output_setting: 'Ajustes de salida',
      disc_high_quality: 'Alta calidad',
      disc_rename_all: 'Renombrar todas las pistas',
      disc_get_cd_info: 'Obtener info del CD',
      disc_compress_level: 'Nivel de compresión',
      disc_btn_change: 'Cambiar',
      disc_btn_convert: 'Convertir',
      disc_ripper_mod_prompt: 'Debe instalar DVDRipper MOD. Haga clic en "Yes" para instalar.',
      btn_yes: 'Sí',
      btn_no: 'No',
    },
    tr: {
      dir: 'ltr',
      app_title: 'FormaLux — Profesyonel Medya Dönüştürücü',
      menu_task: 'Görev',
      menu_theme: 'Tema',
      menu_language: 'Dil',
      menu_options: 'Seçenekler',
      menu_help: 'Yardım',
      menu_start: 'Dönüştürmeyi Başlat',
      menu_stop: 'Durdur / İptal',
      menu_remove: 'Seçileni Kaldır',
      menu_clear: 'Listeyi Temizle',
      menu_output_folder: 'Çıktı Klasörü',
      menu_exit: 'Çıkış',
      theme_nebula: 'Nebula Koyu (Varsayılan)',
      theme_oled: 'OLED Derin Siyah',
      theme_cyber: 'Siber Neon',
      theme_emerald: 'Zümrüt Yeşili',
      theme_light: 'Klasik Açık',
      menu_settings: 'Ayarlar',
      menu_ha_test: 'Donanım Hızlandırma Testi',
      menu_reset_defaults: 'Varsayılana Sıfırla',
      menu_homepage: 'Resmi Web Sitesi',
      menu_check_updates: 'Güncellemeleri Denetle',
      menu_changelog: 'Değişiklik Günlüğü',
      menu_about: 'FormaLux Hakkında',
      tb_output_folder: 'Çıktı Klasörü',
      tb_options: 'Seçenekler',
      tb_remove: 'Kaldır',
      tb_clear: 'Temizle',
      tb_stop: 'Durdur',
      tb_start: 'Başlat',
      cat_video: 'Video',
      cat_audio: 'Ses',
      cat_image: 'Resim',
      cat_document: 'Belge',
      cat_disc: 'ROM / Disk',
      cat_tools: 'Araçlar',
      col_preview: 'Önizleme',
      col_source: 'Kaynak',
      col_output: 'Çıktı / Durum',
      empty_title: 'Dosyaları buraya sürükleyin veya bir araç seçin',
      empty_subtitle: 'Medyanızı ışık hızında dönüştürmeye hazır',
      status_multithread: 'Çoklu İş Parçacığı',
      status_shutdown: 'Dönüşüm sonrası bilgisayarı kapat',
      status_notify: 'Tamamlandığında bildir',
      status_elapsed: 'Geçen Süre',
      modal_options_title: 'Seçenekler',
      tab_general: 'Genel',
      tab_advanced: 'Gelişmiş',
      btn_cancel: 'İptal',
      btn_apply: 'Uygula',
      btn_ok: 'Tamam',
      btn_add_files: 'Dosya Ekle',
      btn_add_folder: '+ Klasör Ekle',
      btn_add_music: '+ Müzik Ekle',
      btn_confirm: 'Kuyruğa Ekle',
      about_tagline: 'Kapsamlı profesyonel medya dönüştürücü',
      st_queued: 'Kuyrukta',
      st_converting: 'Dönüştürülüyor...',
      st_completed: 'Tamamlandı ✓',
      st_failed: 'Başarısız ✗',
      st_cancelled: 'İptal edildi',
      alert_updates_latest: 'FormaLux güncel sürümünü kullanıyorsunuz (v1.0.0)',
      alert_reset_done: 'Ayarlar varsayılana sıfırlandı',
      alert_no_files: 'Lütfen devam etmek için en az bir dosya ekleyin',
      // Tools Translations
      t_v_merge: 'Video Birleştirici & Mux',
      t_v_enhance: 'İyileştir ve Sıkıştır',
      t_v_separate: 'Ses/Video Ayırıcı',
      t_v_crop: 'Video Kırpma',
      t_v_clip: 'Hızlı Kırp',
      t_v_delogo: 'Filigranı Kaldır',
      t_v_frames: 'Kareleri Dışa Aktar',
      t_v_record: 'Ekran Kaydedici',
      t_v_player: 'Medya Oynatıcı',
      t_v_download: 'Video İndirici',
      t_a_merge: 'Ses Birleştirici',
      t_a_split: 'Ses Bölücü',
      t_a_extract: 'Sesi Ayıkla',
      t_a_mix: 'Ses Karıştırıcı',
      t_a_tts: 'Metinden Sese (TTS)',
      t_d_pdf_join: 'PDF Birleştirici',
      t_d_compress: 'PDF Sıkıştır',
      t_d_pic_pdf: 'Resimden PDF\'e',
      t_d_pdf_pic: 'PDF\'ten Resme',
      t_d_pdf_text: 'PDF\'ten Metne',
      t_d_pdf_docx: 'PDF\'ten Word\'e (DOCX)',
      t_d_pdf_excel: 'PDF\'ten Excel\'e',
      t_d_docx_pdf: 'Word\'den PDF\'e',
      t_d_decrypt: 'PDF Kilidini Aç',
      t_d_encrypt: 'PDF Şifrele',
      t_d_zip: 'FFZip Arşivi',
      t_disc_bluray: 'Blu-ray\'den MKV\'ye',
      t_disc_dvd: 'DVD\'den Videoya',
      t_disc_cd: 'Müzik CD\'sinden Sese',
      t_disc_iso: 'DVD/CD\'den ISO/CSO\'ya',
      t_disc_cso: 'ISO ↔ CSO Dönüştürücü',
      t_util_info: 'Medya Bilgisi',
      t_util_rename: 'Toplu Yeniden Adlandır',
      t_util_ha: 'Donanım Hızlandırma Testi',
      t_media_info_title: 'Medya Dosyası Bilgisi',
      btn_copy_clipboard: 'Panoya kopyala',
      copied_to_clipboard: 'Kopyalandı!',
      t_rename_title: 'Yeniden Adlandır',
      lbl_file_type: 'Dosya Türü',
      lbl_entire_tree: 'Tüm Dizin Ağacı',
      lbl_format_group: 'Biçim',
      lbl_pattern: 'Biçim',
      lbl_delimiter: 'Ayırıcı',
      lbl_start_number: 'Numara',
      lbl_date_group: 'Tarih',
      lbl_date_format: 'Tarih',
      lbl_time_format: 'Saat',
      lbl_file_date: 'Dosya Tarihi',
      lbl_current_date: 'Geçerli Tarih',
      lbl_photo_date: 'Fotoğraf Tarihi',
      lbl_remove_group: 'Kaldır',
      lbl_remove_string: 'Kaldırılacak Metin',
      lbl_ignore_datetime: 'Tarih ve saat karakterlerini yoksay',
      btn_rename_action: 'Yeniden Adlandır',
      t_ha_test_title: 'Hardware Acceleration Testing',
      ha_probing: 'Donanım hızlandırma test ediliyor...',
      rename_success: '{count} dosya başarıyla yeniden adlandırıldı!',
      rename_no_files: 'Seçili klasörde eşleşen dosya bulunamadı.',
      modal_files_heading: 'Dosyalar',
      modal_no_files_yet: 'Henüz dosya eklenmedi — "+ Dosya Ekle"ye tıklayın',
      modal_options_heading: 'Dönüşüm Ayarları',
      hint_open_file: 'Dosyayı veya klasörü açmak için çift tıklayın',
      notify_all_completed: 'Tüm dönüştürme işlemleri başarıyla tamamlandı!',
      about_ver: 'Sürüm',
      about_engine: 'İşleme Motoru',
      about_license: 'Lisans',
      about_mit: 'Tamamen Ücretsiz (MIT)',
      output_setting: 'Çıktı Ayarları',
      video_setting_title: 'Video Ayarları',
      audio_setting_title: 'Ses Ayarları',
      picture_setting_title: 'Resim Ayarları',
      btn_save_as: 'Farklı Kaydet',
      btn_default: 'Varsayılan',
      ft_tab_files: 'Seçilen Dosyalar',
      ft_tab_preview: 'Önizleme',
      ft_tab_mediainfo: 'Medya Bilgisi',
      th_file_name: 'Dosya Adı',
      th_size: 'Boyut',
      th_duration: 'Süre / Çözünürlük',
      th_path: 'Kaynak Yolu',
      // Document & Disc Modals
      doc_btn_move_up: 'Yukarı Taşı',
      doc_btn_move_down: 'Aşağı Taşı',
      doc_th_filename: 'Dosya Adı',
      doc_th_size: 'Boyut',
      doc_th_pages: 'Sayfa Aralığı',
      doc_th_status: 'Durum',
      doc_th_action: 'İşlem',
      doc_empty_hint: 'Dosyaları buraya sürükleyin veya soldan bir araç seçin',
      doc_pages_all: 'Tümü',
      st_ready: 'Hazır',
      lbl_save_folder: 'Kayıt Klasörü:',
      btn_browse: 'Gözat',
      btn_open: 'Aç',
      doc_btn_confirm: 'Onayla ve Kuyruğa Ekle',
      disc_btn_confirm: 'Kopyalamayı ve Dönüşümü Başlat',
      disc_btn_refresh: 'Yenile',
      disc_lbl_drive: 'CD/DVD Sürücüsü:',
      disc_lbl_or_iso: 'Veya bilgisayardaki disk klasörü / ISO dosyasından:',
      disc_iso_placeholder: 'D:\\VIDEO_TS veya ISO dosyası...',
      disc_lbl_disc: 'Disk:',
      disc_lbl_type: 'Tür:',
      disc_lbl_size: 'Toplam Boyut:',
      disc_val_standard: 'Standart',
      disc_val_ready: 'Okumaya Hazır',
      disc_banner_default: 'Disk yapısı taranacak ve doğrudan en yüksek kalitede dönüştürülecektir.',
      doc_banner_default: 'Belge orijinal formatına ve en yüksek kalite standartlarına uygun olarak işlenecektir.',
      doc_opt_autocompress: 'Birleştirilen çıktıyı işlemden sonra otomatik olarak sıkıştır',
      doc_opt_bookmarks: 'Orijinal dosyaların yer işaretlerini ve içindekiler tablosunu koru',
      doc_lbl_compress_level: 'Sıkıştırma Düzeyi ve Kalite:',
      doc_opt_compress_balanced: 'Dengeli — 150 DPI (Okuma ve paylaşım için önerilir)',
      doc_opt_compress_high: 'Yüksek Kalite — 300 DPI (Mükemmel baskı kalitesi ve renkler)',
      doc_opt_compress_extreme: 'Maksimum Sıkıştırma — 72 DPI (E-posta için en küçük boyut)',
      doc_opt_del_fonts: 'Kullanılmayan yinelenen yazı tiplerini ve akışları temizle',
      doc_lbl_pic_format: 'Resim Formatı:',
      doc_lbl_pic_dpi: 'Çözünürlük (DPI):',
      doc_lbl_pic_mode: 'Ayıklama Modu:',
      doc_opt_mode_pages: 'Her sayfayı tam resim olarak aktar',
      doc_opt_mode_embedded: 'Yalnızca gömülü resimleri ayıkla',
      doc_lbl_page_size: 'Sayfa Boyutu:',
      doc_lbl_orientation: 'Yönlendirme:',
      doc_opt_orient_auto: 'Otomatik (resim oranına göre)',
      doc_opt_orient_portrait: 'Dikey (Portrait)',
      doc_opt_orient_landscape: 'Yatay (Landscape)',
      doc_lbl_margins: 'Kenar Boşlukları:',
      doc_opt_margin_none: 'Kenar boşluğu yok (tam sayfa)',
      doc_opt_margin_small: 'Küçük kenar boşlukları (10mm)',
      doc_lbl_pwd_open: 'Belge Açılış Şifresi:',
      doc_lbl_pwd_owner: 'Yönetici / İzinler Şifresi:',
      doc_opt_perm_print: 'Belgenin yazdırılmasına izin ver',
      doc_opt_perm_copy: 'Metin ve içerik kopyalamaya izin ver',
      doc_lbl_decrypt_pwd: 'Kilidi açmak için geçerli şifre:',
      doc_lbl_range: 'Sayfa Aralığı:',
      doc_range_placeholder: 'örn. 1-5, 8, 12 (tümü için boş bırakın)',
      doc_opt_ocr: 'Tabloları, stilleri ve belge düzenini tam olarak koru',
      doc_lbl_zip_level: 'Sıkıştırma Düzeyi:',
      doc_opt_zip_normal: 'Normal (dengeli ve hızlı)',
      doc_opt_zip_max: 'Maksimum (en küçük arşiv boyutu)',
      doc_opt_zip_fast: 'Çok Hızlı',
      doc_lbl_zip_pwd: 'Arşiv Şifresi (isteğe bağlı):',
      doc_zip_pwd_placeholder: 'Şifresiz için boş bırakın',
      disc_lbl_title: 'Başlık:',
      disc_lbl_chapters: 'Bölümler:',
      disc_lbl_from: 'Başlangıç',
      disc_lbl_to: 'Bitiş',
      disc_lbl_audio_stream: 'Ses Akışı:',
      disc_lbl_subtitle: 'Altyazı Akışı:',
      disc_opt_sub_none: 'Yok (Altyazısız)',
      disc_lbl_output_format: 'Çıktı Formatı:',
      disc_opt_deinterlace: 'Taramayı Kaldır (YADIF Deinterlace)',
      disc_btn_fetch_cddb: '🌐 CD Bilgilerini Getir (gnudb.org)',
      disc_status_cddb_ready: 'Disk veritabanına bağlanmaya hazır',
      disc_lbl_cd_format: 'Çıktı Ses Formatı:',
      disc_th_track: 'Parça',
      disc_th_title: 'Parça Başlığı',
      disc_th_artist: 'Sanatçı',
      disc_th_duration: 'Süre',
      disc_lbl_iso_target: 'Hedef Disk İmajı:',
      disc_lbl_cso_level: 'CSO Sıkıştırma Düzeyi (1-9):',
      t_disc_iso_title: 'DVD/CD\'den ISO/CSO\'ya',
      t_disc_cso_modal_title: 'ISO <--> CSO',
      t_disc_cd_title: 'Müzik CD\'si Ses Dosyasına',
      disc_cd_driver: 'CD Sürücüsü',
      disc_output_setting: 'Çıktı Ayarları',
      disc_high_quality: 'Yüksek kalite',
      disc_rename_all: 'Tüm parçaları yeniden adlandır',
      disc_get_cd_info: 'CD Bilgisi Al',
      disc_compress_level: 'Sıkıştırma Seviyesi',
      disc_btn_change: 'Değiştir',
      disc_btn_convert: 'Dönüştür',
      disc_ripper_mod_prompt: 'DVDRipper MOD yüklenmelidir. Yüklemek için "Yes"e tıklayın.',
      btn_yes: 'Evet',
      btn_no: 'Hayır',
    }
  };

  // ========== Tool Definitions (All 56 Tools) ==========
  const TOOL_DEFS = {
    // VIDEO
    v_mp4: { name: '→ MP4', section: 'video', ext: '.mp4', filters: [{ name: 'Video', extensions: ['mp4','mkv','avi','mov','wmv','flv','webm','mpg','3gp','ts','m4v'] }],
      options: [
        { key: 'quality', label: 'الجودة / Quality', type: 'select', choices: [['high','عالية / High'],['medium','متوسطة / Medium'],['low','صغيرة / Low']], default: 'medium' },
        { key: 'resolution', label: 'الدقة / Resolution', type: 'select', choices: [['','الأصلية / Original'],['2160','4K (2160p)'],['1080','Full HD (1080p)'],['720','HD (720p)'],['480','SD (480p)']], default: '' },
        { key: 'fps', label: 'الإطارات/ث / FPS', type: 'select', choices: [['','الأصلي / Original'],['60','60 fps'],['30','30 fps'],['24','24 fps']], default: '' },
        { key: 'audioBitrate', label: 'جودة الصوت / Audio', type: 'select', choices: [['320','320 kbps'],['256','256 kbps'],['192','192 kbps'],['128','128 kbps']], default: '192' },
      ]
    },
    v_mkv: { name: '→ MKV', section: 'video', ext: '.mkv', filters: [{ name: 'Video', extensions: ['mp4','mkv','avi','mov','wmv','flv','webm','mpg','ts'] }],
      options: [
        { key: 'copy', label: 'نسخ فوري بدون إعادة ترميز (Direct Stream Copy)', type: 'checkbox', default: false },
        { key: 'quality', label: 'الجودة / Quality', type: 'select', choices: [['high','عالية / High'],['medium','متوسطة / Medium'],['low','صغيرة / Low']], default: 'medium' },
        { key: 'resolution', label: 'الدقة / Resolution', type: 'select', choices: [['','الأصلية / Original'],['1080','1080p'],['720','720p']], default: '' },
      ]
    },
    v_gif: { name: '→ GIF', section: 'video', ext: '.gif', filters: [{ name: 'Video', extensions: ['mp4','mkv','avi','mov','webm'] }],
      options: [
        { key: 'width', label: 'العرض (بكسل)', type: 'number', default: 480, min: 100, max: 1920 },
        { key: 'fps', label: 'الإطارات/ث', type: 'number', default: 15, min: 5, max: 30 },
        { key: 'duration', label: 'أقصى مدة (ثواني)', type: 'number', default: 10, min: 1, max: 60 },
      ]
    },
    v_webm: { name: '→ WebM', section: 'video', ext: '.webm', filters: [{ name: 'Video', extensions: ['mp4','mkv','avi','mov','webm','flv'] }],
      options: [
        { key: 'quality', label: 'الجودة', type: 'select', choices: [['high','عالية'],['medium','متوسطة'],['low','صغيرة']], default: 'medium' },
      ]
    },
    v_avi: { name: '→ AVI / MOV / FLV', section: 'video', ext: '.avi', filters: [{ name: 'Video', extensions: ['mp4','mkv','avi','mov','wmv','flv','webm'] }],
      options: [
        { key: 'outputExt', label: 'الصيغة الناتجة', type: 'select', choices: [['.avi','AVI'],['.flv','FLV'],['.mov','MOV'],['.wmv','WMV'],['.mpg','MPG'],['.3gp','3GP'],['.ts','TS'],['.m4v','M4V']], default: '.avi' },
        { key: 'quality', label: 'الجودة', type: 'select', choices: [['high','عالية'],['medium','متوسطة'],['low','صغيرة']], default: 'medium' },
      ]
    },
    v_merge: { name: 'دامج & Mux', section: 'video', ext: '.mp4', multi: true, filters: [{ name: 'Video', extensions: ['mp4','mkv','avi','mov','ts'] }],
      options: [
        { key: 'mode', label: 'نوع العملية', type: 'select', choices: [['concat','دمج مقاطع فيديو بالتتابع'],['compress','ضغط الفيديو']], default: 'concat' },
      ]
    },
    v_enhance: { name: 'تحسين وضغط', section: 'video', ext: '.mp4', filters: [{ name: 'Video', extensions: ['mp4','mkv','avi','mov'] }],
      options: [
        { key: 'mode', label: 'الوضع', type: 'select', choices: [['enhance','تحسين الجودة وإزالة التشويش (Denoise + Sharpen)'],['compress','ضغط الفيديو لتقليل الحجم']], default: 'enhance' },
      ]
    },
    v_separate: { name: 'الفاصل', section: 'video', ext: '.mp4', filters: [{ name: 'Video', extensions: ['mp4','mkv','avi','mov'] }],
      options: [
        { key: 'target', label: 'استخراج', type: 'select', choices: [['video','استخراج فيديو صامت فقط (بدون صوت)'],['audio','استخراج ملف الصوت فقط']], default: 'audio' },
      ]
    },
    v_crop: { name: 'قص الإطار (Crop)', section: 'video', ext: '.mp4', filters: [{ name: 'Video', extensions: ['mp4','mkv','avi','mov'] }],
      options: [
        { key: 'ratio', label: 'نسبة الأبعاد', type: 'select', choices: [['16:9','16:9 عريض'],['9:16','9:16 تيك توك / ريلز'],['1:1','1:1 مربع'],['4:3','4:3 تقليدي']], default: '16:9' },
      ]
    },
    v_clip: { name: 'مقطع سريع', section: 'video', ext: '.mp4', filters: [{ name: 'Video', extensions: ['mp4','mkv','avi','mov'] }],
      options: [
        { key: 'start', label: 'وقت البداية (00:00:00)', type: 'text', default: '00:00:00' },
        { key: 'end', label: 'وقت النهاية (00:01:00)', type: 'text', default: '00:01:00' },
      ]
    },
    v_remove_watermark: { name: 'إزالة العلامة المائية', i18nKey: 't_v_delogo', section: 'video', ext: '.mp4', filters: [{ name: 'Video', extensions: ['mp4','mkv','avi','mov'] }],
      options: [
        { key: 'x', label: 'إحداثي X', type: 'number', default: 10 },
        { key: 'y', label: 'إحداثي Y', type: 'number', default: 10 },
        { key: 'w', label: 'عرض الشعار', type: 'number', default: 100 },
        { key: 'h', label: 'ارتفاع الشعار', type: 'number', default: 50 },
      ]
    },
    v_frames: { name: 'إطارات التصدير', section: 'video', ext: '.jpg', filters: [{ name: 'Video', extensions: ['mp4','mkv','avi','mov'] }],
      options: [
        { key: 'interval', label: 'استخراج صورة كل (ثانية)', type: 'number', default: 1, min: 1, max: 60 },
      ]
    },
    v_record: { name: 'مسجل الشاشة', section: 'video', ext: '.mp4', noFiles: true,
      options: [
        { key: 'fps', label: 'معدل الإطارات', type: 'number', default: 30, min: 15, max: 60 },
        { key: 'duration', label: 'مدة التسجيل (ثانية)', type: 'number', default: 60, min: 5, max: 3600 },
      ]
    },
    v_player: { name: 'Format Player', section: 'video', ext: '', filters: [{ name: 'Media', extensions: ['*'] }], noQueue: true, options: [] },
    v_download: { name: 'تنزيل الفيديو', section: 'video', ext: '.mp4', noFiles: true,
      options: [
        { key: 'url', label: 'رابط الفيديو المباشر', type: 'text', placeholder: 'https://...' },
      ]
    },

    // AUDIO
    a_merge: { name: 'دامج الصوت', section: 'audio', ext: '.mp3', multi: true, filters: [{ name: 'Audio', extensions: ['mp3','wav','flac','m4a','ogg'] }], options: [] },
    a_split: { name: 'Split Music', section: 'audio', ext: '.mp3', filters: [{ name: 'Audio', extensions: ['mp3','wav','flac','m4a'] }],
      options: [
        { key: 'segmentTime', label: 'مدة كل جزء (ثانية)', type: 'number', default: 300, min: 10 },
      ]
    },
    a_extract: { name: 'استخراج الصوت من فيديو', section: 'audio', ext: '.mp3', filters: [{ name: 'Video', extensions: ['mp4','mkv','avi','mov'] }], options: [] },
    a_mix: { name: 'مزيج (Audio Mix)', section: 'audio', ext: '.mp3', multi: true, filters: [{ name: 'Audio', extensions: ['mp3','wav','flac','m4a'] }], options: [] },
    a_tts: { name: 'Text to Wav', section: 'audio', ext: '.wav', noFiles: true,
      options: [
        { key: 'text', label: 'النص المطلوب تحويله لصوت', type: 'textarea', default: 'مرحباً بك في FormaLux' },
      ]
    },
    a_mp3: { name: '→ MP3', section: 'audio', ext: '.mp3', filters: [{ name: 'Audio', extensions: ['wav','flac','m4a','wma','ogg','aac'] }],
      options: [
        { key: 'bitrate', label: 'معدل البت (Bitrate)', type: 'select', choices: [['320','320 kbps (أعلى جودة)'],['256','256 kbps'],['192','192 kbps (الافتراضي)'],['128','128 kbps']], default: '192' },
      ]
    },
    a_wma: { name: '→ WMA', section: 'audio', ext: '.wma', filters: [{ name: 'Audio', extensions: ['mp3','wav','flac'] }], options: [] },
    a_m4a: { name: '→ M4A', section: 'audio', ext: '.m4a', filters: [{ name: 'Audio', extensions: ['mp3','wav','flac'] }], options: [] },
    a_flac: { name: '→ FLAC (Lossless)', section: 'audio', ext: '.flac', filters: [{ name: 'Audio', extensions: ['mp3','wav','m4a'] }], options: [] },
    a_wav: { name: '→ WAV', section: 'audio', ext: '.wav', filters: [{ name: 'Audio', extensions: ['mp3','flac','m4a'] }], options: [] },
    a_aac: { name: '→ AAC / AC3 / DTS', section: 'audio', ext: '.aac', filters: [{ name: 'Audio', extensions: ['mp3','wav','flac'] }],
      options: [
        { key: 'outputExt', label: 'الصيغة', type: 'select', choices: [['.aac','AAC'],['.ac3','AC3 Dolby'],['.opus','Opus'],['.ogg','OGG Vorbis']], default: '.aac' },
      ]
    },

    // IMAGES
    i_webp: { name: '→ WebP', section: 'image', ext: '.webp', filters: [{ name: 'Images', extensions: ['jpg','jpeg','png','bmp','gif','tif'] }], options: [] },
    i_jpg: { name: '→ JPG', section: 'image', ext: '.jpg', filters: [{ name: 'Images', extensions: ['webp','png','bmp','gif','tif','ico'] }], options: [] },
    i_png: { name: '→ PNG', section: 'image', ext: '.png', filters: [{ name: 'Images', extensions: ['webp','jpg','bmp','gif','tif','ico'] }], options: [] },
    i_ico: { name: '→ ICO', section: 'image', ext: '.ico', filters: [{ name: 'Images', extensions: ['png','jpg','webp','bmp'] }], options: [] },
    i_bmp: { name: '→ BMP', section: 'image', ext: '.bmp', filters: [{ name: 'Images', extensions: ['png','jpg','webp'] }], options: [] },
    i_gif: { name: '→ GIF (صورة)', section: 'image', ext: '.gif', filters: [{ name: 'Images', extensions: ['png','jpg','webp','bmp'] }], options: [] },
    i_tif: { name: '→ TIF', section: 'image', ext: '.tif', filters: [{ name: 'Images', extensions: ['png','jpg','webp'] }], options: [] },
    i_tga: { name: '→ TGA', section: 'image', ext: '.tga', filters: [{ name: 'Images', extensions: ['png','jpg','webp'] }], options: [] },

    // DOCUMENTS
    d_pdf_join: { name: 'PDF Joiner', section: 'document', ext: '.pdf', multi: true, filters: [{ name: 'PDF', extensions: ['pdf'] }], options: [] },
    d_pdf_compress: { name: 'ضغط PDF', i18nKey: 't_d_compress', section: 'document', ext: '.pdf', filters: [{ name: 'PDF', extensions: ['pdf'] }], options: [] },
    d_pic_pdf: { name: 'Pic → PDF', section: 'document', ext: '.pdf', multi: true, filters: [{ name: 'Images', extensions: ['jpg','png','webp'] }], options: [] },
    d_pdf_pic: { name: 'PDF → Pic', section: 'document', ext: '.jpg', filters: [{ name: 'PDF', extensions: ['pdf'] }], options: [] },
    d_pdf_text: { name: 'PDF → Text', section: 'document', ext: '.txt', filters: [{ name: 'PDF', extensions: ['pdf'] }], options: [] },
    d_pdf_docx: { name: 'PDF → Docx', section: 'document', ext: '.docx', filters: [{ name: 'PDF', extensions: ['pdf'] }], options: [] },
    d_pdf_excel: { name: 'PDF → Excel', section: 'document', ext: '.xlsx', filters: [{ name: 'PDF', extensions: ['pdf'] }], options: [] },
    d_docx_pdf: { name: 'Docx → PDF', section: 'document', ext: '.pdf', filters: [{ name: 'Word', extensions: ['docx','doc'] }], options: [] },
    d_pdf_decrypt: { name: 'فك تشفير PDF', i18nKey: 't_d_decrypt', section: 'document', ext: '.pdf', filters: [{ name: 'PDF', extensions: ['pdf'] }], options: [] },
    d_pdf_encrypt: { name: 'تشفير PDF', i18nKey: 't_d_encrypt', section: 'document', ext: '.pdf', filters: [{ name: 'PDF', extensions: ['pdf'] }], options: [] },
    d_ffzip: { name: 'FFZip (أرشيف)', i18nKey: 't_d_zip', section: 'document', ext: '.zip', multi: true, filters: [{ name: 'All Files', extensions: ['*'] }], options: [] },
    d_epub: { name: '→ EPub', section: 'document', ext: '.epub', filters: [{ name: 'Documents', extensions: ['txt','html','md','pdf'] }], options: [] },
    d_mobi: { name: '→ Mobi', section: 'document', ext: '.mobi', filters: [{ name: 'Documents', extensions: ['epub','txt','pdf'] }], options: [] },
    d_azw3: { name: '→ AZW3', section: 'document', ext: '.azw3', filters: [{ name: 'Documents', extensions: ['epub','mobi','pdf'] }], options: [] },

    // DISCS / ISO
    disc_bluray_mkv: { name: 'Bluray → MKV', i18nKey: 't_disc_bluray', section: 'disc', ext: '.mkv', dirInput: true, options: [] },
    disc_dvd_video: { name: 'DVD → Video', i18nKey: 't_disc_dvd', section: 'disc', ext: '.mp4', dirInput: true, options: [] },
    disc_cd_audio: { name: 'CD → Audio', i18nKey: 't_disc_cd', section: 'disc', ext: '.mp3', dirInput: true, options: [] },
    disc_dvd_iso: { name: 'DVD/CD → ISO', i18nKey: 't_disc_iso', section: 'disc', ext: '.iso', dirInput: true, options: [] },
    disc_iso_cso: { name: 'ISO ↔ CSO', i18nKey: 't_disc_cso', section: 'disc', ext: '.cso', filters: [{ name: 'Disc Images', extensions: ['iso','cso'] }], options: [] },

    // UTILITIES
    util_info: { name: 'معلومات الملف', i18nKey: 't_util_info', section: 'tools', ext: '', filters: [{ name: 'Media', extensions: ['*'] }], noQueue: true, options: [] },
    util_rename: { name: 'إعادة تسمية مجمعة', i18nKey: 't_util_rename', section: 'tools', ext: '', multi: true, filters: [{ name: 'All', extensions: ['*'] }], noQueue: true, options: [] },
    util_ha_test: { name: 'HA Test (تسريع العتاد)', i18nKey: 't_util_ha', section: 'tools', ext: '', noFiles: true, noQueue: true, options: [] },
  };

  // Helper to dynamically get translated tool name
  function getToolName(toolType) {
    const b = I18N[currentLang] || I18N.ar;
    const def = TOOL_DEFS[toolType];
    if (!def) return toolType;
    const key = def.i18nKey || `t_${toolType}`;
    if (b[key]) return b[key];
    return def.name;
  }

  // ========== Init ==========
  async function init() {
    try {
      settings = await window.api.getSettings();
      if (settings && settings.outputDir && settings.outputDir.includes('FFOutput')) {
        settings.outputDir = settings.outputDir.replace(/FFOutput/g, 'FLoutput');
        window.api.saveSettings(settings);
      }
    } catch (e) {
      settings = {};
    }

    // Set initial theme & language
    currentTheme = settings.theme || 'default';
    currentLang = settings.language || 'ar';
    applyTheme(currentTheme, false);
    applyLanguage(currentLang, false);

    setupTitlebar();
    setupDropdownMenus();
    setupSidebar();
    setupToolCards();
    setupToolbar();
    setupModals();
    setupDragDrop();
    setupTaskListeners();
    setupKeyboardShortcuts();
    updateOutputPathDisplay();

    // Start CPU monitor simulation
    setInterval(updateCpuBadge, 2500);
  }

  // ========== Language (i18n) Engine ==========
  function applyLanguage(langCode, save = true) {
    if (!I18N[langCode]) langCode = 'ar';
    currentLang = langCode;

    const bundle = I18N[langCode];
    document.documentElement.dir = bundle.dir;
    document.documentElement.lang = langCode;

    // Update title
    document.getElementById('txt-app-title').textContent = bundle.app_title;
    document.title = bundle.app_title;

    // Update menu bar main button labels
    document.getElementById('menu-task').textContent = bundle.menu_task;
    document.getElementById('menu-theme').textContent = bundle.menu_theme;
    document.getElementById('menu-language').textContent = bundle.menu_language;
    document.getElementById('menu-options').textContent = bundle.menu_options;
    document.getElementById('menu-help').textContent = bundle.menu_help;

    // Update all elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (bundle[key]) {
        el.textContent = bundle[key];
      }
    });

    // Mark active in language dropdown
    document.querySelectorAll('.lang-item').forEach(item => {
      const isSelected = item.dataset.setLang === langCode;
      item.classList.toggle('active', isSelected);
      const check = item.querySelector('.menu-check');
      if (check) check.textContent = isSelected ? '✓' : '';
    });

    // Update active tasks tool names if queued
    tasks.forEach(t => {
      t.name = getToolName(t.type);
    });
    renderTasks();

    // Update modal title and content if open
    if (currentToolType) {
      const modalTitle = document.getElementById('tool-modal-title');
      if (modalTitle) modalTitle.textContent = getToolName(currentToolType);
      renderModalFiles();
      const headings = document.querySelectorAll('#tool-options-modal .tool-option-section h4');
      if (headings[0] && bundle.modal_files_heading) headings[0].textContent = bundle.modal_files_heading;
      if (headings[1] && bundle.modal_options_heading) headings[1].textContent = bundle.modal_options_heading;
    }

    // Update document and disc modals if open
    if (typeof updateDocModalLanguage === 'function') updateDocModalLanguage();
    if (typeof updateDiscModalLanguage === 'function') updateDiscModalLanguage();

    if (save) {
      settings.language = langCode;
      window.api.saveSettings({ language: langCode });
    }
  }

  // ========== Theme Switcher Engine ==========
  function applyTheme(themeName, save = true) {
    currentTheme = themeName;
    document.documentElement.setAttribute('data-theme', themeName);

    // Mark active in theme dropdown
    document.querySelectorAll('.theme-item').forEach(item => {
      const isSelected = item.dataset.setTheme === themeName;
      item.classList.toggle('active', isSelected);
      const check = item.querySelector('.menu-check');
      if (check) check.textContent = isSelected ? '✓' : '';
    });

    if (save) {
      settings.theme = themeName;
      window.api.saveSettings({ theme: themeName });
    }
  }

  // ========== Dropdown Menus Setup ==========
  function setupDropdownMenus() {
    const menuButtons = [
      { id: 'menu-task', dropdown: 'dropdown-task' },
      { id: 'menu-theme', dropdown: 'dropdown-theme' },
      { id: 'menu-language', dropdown: 'dropdown-language' },
      { id: 'menu-options', dropdown: 'dropdown-options' },
      { id: 'menu-help', dropdown: 'dropdown-help' },
    ];

    menuButtons.forEach(({ id, dropdown }) => {
      const btn = document.getElementById(id);
      const dd = document.getElementById(dropdown);
      if (!btn || !dd) return;

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (openDropdownId === dropdown) {
          closeAllDropdowns();
        } else {
          openDropdown(dropdown, btn);
        }
      });

      btn.addEventListener('mouseenter', () => {
        if (openDropdownId && openDropdownId !== dropdown) {
          openDropdown(dropdown, btn);
        }
      });
    });

    // Close on outside click
    document.addEventListener('click', () => {
      closeAllDropdowns();
    });

    // Theme selector click handlers
    document.querySelectorAll('.theme-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const theme = item.dataset.setTheme;
        applyTheme(theme, true);
        closeAllDropdowns();
      });
    });

    // Language selector click handlers
    document.querySelectorAll('.lang-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const lang = item.dataset.setLang;
        applyLanguage(lang, true);
        closeAllDropdowns();
      });
    });

    // Task Actions
    document.getElementById('menu-action-start')?.addEventListener('click', () => {
      closeAllDropdowns();
      startAllTasks();
    });
    document.getElementById('menu-action-stop')?.addEventListener('click', () => {
      closeAllDropdowns();
      stopAllTasks();
    });
    document.getElementById('menu-action-remove')?.addEventListener('click', () => {
      closeAllDropdowns();
      removeSelectedTask();
    });
    document.getElementById('menu-action-clear')?.addEventListener('click', () => {
      closeAllDropdowns();
      clearAllTasks();
    });
    document.getElementById('menu-action-folder')?.addEventListener('click', async () => {
      closeAllDropdowns();
      await window.api.openFolder();
    });
    document.getElementById('menu-action-exit')?.addEventListener('click', () => {
      window.api.close();
    });

    // Options Actions
    document.getElementById('menu-action-settings')?.addEventListener('click', () => {
      closeAllDropdowns();
      openOptionsModal();
    });
    document.getElementById('menu-action-ha')?.addEventListener('click', () => {
      closeAllDropdowns();
      openHaTestModal();
    });
    document.getElementById('menu-action-reset-defaults')?.addEventListener('click', () => {
      closeAllDropdowns();
      resetSettings();
    });

    // Help Actions
    document.getElementById('menu-action-site')?.addEventListener('click', (e) => {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      closeAllDropdowns();
      alert('FormaLux v1.0.0 — Official Website: https://github.com/formalux');
    });
    document.getElementById('menu-action-updates')?.addEventListener('click', (e) => {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      closeAllDropdowns();
      triggerCheckForUpdates(true);
    });
    document.getElementById('menu-action-changelog')?.addEventListener('click', (e) => {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      closeAllDropdowns();
      alert('FormaLux v1.0.0 Changelog:\n• Initial Release\n• 56 Conversion Tools\n• Multi-Theme Engine & Multi-Language Support\n• Full FFmpeg / FFprobe Hardware Acceleration');
    });
    document.getElementById('menu-action-about')?.addEventListener('click', (e) => {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      closeAllDropdowns();
      openAboutModal();
    });
  }

  function openDropdown(dropdownId, btn) {
    closeAllDropdowns();
    const dd = document.getElementById(dropdownId);
    if (dd) {
      dd.classList.add('show');
      btn.classList.add('active');
      openDropdownId = dropdownId;
    }
  }

  function closeAllDropdowns() {
    document.querySelectorAll('.menu-dropdown').forEach(dd => dd.classList.remove('show'));
    document.querySelectorAll('.menu-item').forEach(btn => btn.classList.remove('active'));
    openDropdownId = null;
  }

  // ========== Titlebar ==========
  function setupTitlebar() {
    document.getElementById('btn-minimize').addEventListener('click', () => window.api.minimize());
    document.getElementById('btn-maximize').addEventListener('click', () => window.api.maximize());
    document.getElementById('btn-close').addEventListener('click', () => window.api.close());
    window.api.onMaximized((maximized) => {
      const btn = document.getElementById('btn-maximize');
      btn.title = maximized ? (currentLang === 'ar' ? 'استعادة' : 'Restore') : (currentLang === 'ar' ? 'تكبير' : 'Maximize');
    });
  }

  // ========== Sidebar Navigation ==========
  function setupSidebar() {
    document.querySelectorAll('.sidebar-section').forEach(section => {
      section.addEventListener('click', () => {
        const sectionName = section.dataset.section;
        setActiveSection(sectionName);
      });
    });
  }

  function setActiveSection(sectionName) {
    activeSection = sectionName;
    document.querySelectorAll('.sidebar-section').forEach(s => {
      s.classList.toggle('active', s.dataset.section === sectionName);
    });
    document.querySelectorAll('.tools-grid').forEach(g => {
      g.classList.toggle('hidden', g.dataset.section !== sectionName);
    });
  }

  // ========== Tool Cards ==========
  function setupToolCards() {
    document.querySelectorAll('.tool-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        const toolType = card.dataset.tool;
        if (toolType === 'util_info') {
          openMediaInfoModal();
          return;
        }
        if (toolType === 'util_rename') {
          openRenameModal();
          return;
        }
        if (toolType === 'util_ha_test') {
          openHaTestModal();
          return;
        }
        if (toolType === 'v_player') {
          playMediaWithSystem();
          return;
        }
        if (toolType.startsWith('d_')) {
          openDocumentTaskModal(toolType);
          return;
        }
        if (toolType.startsWith('disc_')) {
          openDiscTaskModal(toolType);
          return;
        }
        if (isFormatConversionTool(toolType)) {
          openFormatTaskModal(toolType, []);
          return;
        }
        openToolModal(toolType);
      });
    });
  }

  // ========== Tool Modal ==========
  function openToolModal(toolType) {
    const def = TOOL_DEFS[toolType];
    if (!def) return;

    currentToolType = toolType;
    currentToolFiles = [];

    const b = I18N[currentLang] || I18N.ar;
    const modal = document.getElementById('tool-options-modal');
    const title = document.getElementById('tool-modal-title');
    const body = document.getElementById('tool-modal-body');
    const addBtn = document.getElementById('btn-add-files');

    title.textContent = getToolName(toolType);
    body.innerHTML = '';

    // Files section
    if (!def.noFiles) {
      const filesSection = document.createElement('div');
      filesSection.className = 'tool-option-section';
      filesSection.innerHTML = `<h4>${b.modal_files_heading || 'Files'}</h4><div class="files-list" id="modal-files-list"><div style="padding:16px;text-align:center;color:var(--text-muted);font-size:12px;">${b.modal_no_files_yet || 'No files added yet — click "+ Add Files"'}</div></div>`;
      body.appendChild(filesSection);
      addBtn.style.display = 'flex';
    } else {
      addBtn.style.display = 'none';
    }

    // Options section
    if (def.options && def.options.length > 0) {
      const optSection = document.createElement('div');
      optSection.className = 'tool-option-section';
      optSection.innerHTML = `<h4>${b.modal_options_heading || 'Conversion Settings'}</h4>`;

      def.options.forEach(opt => {
        const row = document.createElement('div');
        row.className = 'tool-option-row';

        const label = document.createElement('label');
        label.textContent = opt.label;
        row.appendChild(label);

        let input;
        if (opt.type === 'select') {
          input = document.createElement('select');
          input.id = `tool-opt-${opt.key}`;
          opt.choices.forEach(([val, text]) => {
            const option = document.createElement('option');
            option.value = val;
            option.textContent = text;
            if (val === opt.default?.toString()) option.selected = true;
            input.appendChild(option);
          });
        } else if (opt.type === 'checkbox') {
          input = document.createElement('input');
          input.type = 'checkbox';
          input.id = `tool-opt-${opt.key}`;
          input.checked = opt.default;
        } else if (opt.type === 'textarea') {
          input = document.createElement('textarea');
          input.id = `tool-opt-${opt.key}`;
          input.value = opt.default || '';
          input.style.cssText = 'width:100%;min-height:80px;padding:8px;background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:6px;color:var(--text-primary);font-family:inherit;font-size:13px;resize:vertical;';
        } else {
          input = document.createElement('input');
          input.type = opt.type || 'text';
          input.id = `tool-opt-${opt.key}`;
          input.value = opt.default || '';
          if (opt.placeholder) input.placeholder = opt.placeholder;
          if (opt.min !== undefined) input.min = opt.min;
          if (opt.max !== undefined) input.max = opt.max;
        }

        row.appendChild(input);
        optSection.appendChild(row);
      });

      body.appendChild(optSection);
    }

    modal.classList.remove('hidden');
  }

  function closeToolModal() {
    document.getElementById('tool-options-modal').classList.add('hidden');
    currentToolType = null;
    currentToolFiles = [];
  }

  function collectToolOptions() {
    const def = TOOL_DEFS[currentToolType];
    if (!def) return {};
    const opts = { outputExt: def.ext };
    if (def.options) {
      def.options.forEach(opt => {
        const el = document.getElementById(`tool-opt-${opt.key}`);
        if (el) {
          if (opt.type === 'checkbox') opts[opt.key] = el.checked;
          else if (opt.type === 'number') opts[opt.key] = parseFloat(el.value);
          else opts[opt.key] = el.value;
        }
      });
    }
    return opts;
  }

  async function addFilesToTool() {
    const def = TOOL_DEFS[currentToolType];
    if (!def) return;

    let files;
    if (def.dirInput) {
      const folder = await window.api.selectFolder();
      if (folder) files = [folder];
    } else {
      files = await window.api.selectFiles(def.filters);
    }

    if (files && files.length > 0) {
      currentToolFiles.push(...files);
      renderModalFiles();
    }
  }

  function renderModalFiles() {
    const list = document.getElementById('modal-files-list');
    if (!list) return;

    const b = I18N[currentLang] || I18N.ar;

    if (currentToolFiles.length === 0) {
      list.innerHTML = `<div style="padding:16px;text-align:center;color:var(--text-muted);font-size:12px;">${b.modal_no_files_yet || 'No files added yet'}</div>`;
      return;
    }

    list.innerHTML = currentToolFiles.map((f, i) => `
      <div class="file-item">
        <span class="file-name" title="${f}">${f.split(/[/\\]/).pop()}</span>
        <button class="file-remove" data-index="${i}" title="${b.tb_remove || 'Remove'}">×</button>
      </div>
    `).join('');

    list.querySelectorAll('.file-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        currentToolFiles.splice(parseInt(btn.dataset.index), 1);
        renderModalFiles();
      });
    });
  }

  function confirmTool() {
    const def = TOOL_DEFS[currentToolType];
    if (!def) return;

    const b = I18N[currentLang] || I18N.ar;

    if (!def.noFiles && currentToolFiles.length === 0) {
      alert(b.alert_no_files);
      return;
    }

    const options = collectToolOptions();

    if (def.multi) {
      addTask({
        type: currentToolType,
        input: currentToolFiles,
        options,
        name: getToolName(currentToolType),
      });
    } else if (def.noFiles) {
      addTask({
        type: currentToolType,
        input: options.url || 'FormaLux Process',
        options,
        name: getToolName(currentToolType),
      });
    } else {
      currentToolFiles.forEach(file => {
        addTask({
          type: currentToolType,
          input: file,
          options,
          name: getToolName(currentToolType),
        });
      });
    }

    closeToolModal();
  }

  // ========== Task Queue Management ==========
  function addTask(taskData) {
    const task = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
      ...taskData,
      status: 'queued',
      progress: 0,
      createdAt: new Date(),
    };
    tasks.push(task);
    renderTasks();
  }

  function renderTasks() {
    const list = document.getElementById('task-list');
    const empty = document.getElementById('empty-state');

    if (tasks.length === 0) {
      if (empty) empty.style.display = 'flex';
      list.querySelectorAll('.task-item').forEach(el => el.remove());
      return;
    }

    if (empty) empty.style.display = 'none';

    list.querySelectorAll('.task-item').forEach(el => el.remove());

    const b = I18N[currentLang] || I18N.ar;

    tasks.forEach(task => {
      const inputName = Array.isArray(task.input)
        ? `${task.input.length} Files`
        : (task.input || '').split(/[/\\]/).pop();

      const statusMap = {
        queued: b.st_queued,
        converting: b.st_converting,
        completed: b.st_completed,
        failed: b.st_failed,
        cancelled: b.st_cancelled,
      };
      const statusText = statusMap[task.status] || task.status;

      const el = document.createElement('div');
      el.className = `task-item ${task.status}`;
      if (task.id === selectedTaskId) el.classList.add('selected');
      el.dataset.taskId = task.id;
      el.title = task.status === 'completed' ? (b.hint_open_file || 'Double-click to open file or folder') : (task.error || '');
      el.innerHTML = `
        <div class="task-preview">
          <span class="preview-badge" style="font-size:11px;font-weight:700;padding:3px 8px;border-radius:4px;background:var(--bg-tertiary);color:var(--accent-glow);">${task.options?.outputExt || ''}</span>
        </div>
        <div class="task-source" title="${Array.isArray(task.input) ? task.input.join(', ') : task.input}">${Array.isArray(task.input) ? task.input.map(f => f.split(/[/\\]/).pop()).join(', ') : (task.input || '').split(/[/\\]/).pop()}</div>
        <div class="task-output">
          <div class="task-filename">${task.name} — ${inputName}</div>
          <div class="task-status" style="color:${task.status === 'completed' ? 'var(--success)' : task.status === 'failed' ? 'var(--danger)' : ''}">
            ${statusText}${task.error ? ` <span style="font-size:10px;opacity:0.85;">(${task.error})</span>` : ''}${task.status === 'converting' ? ` (${Math.round(task.progress)}%)` : ''}
          </div>
          ${task.status === 'converting' ? `<div class="task-progress-bar"><div class="task-progress-fill" style="width:${task.progress}%"></div></div>` : ''}
        </div>
      `;

      el.addEventListener('click', () => {
        document.querySelectorAll('.task-item').forEach(t => t.classList.remove('selected'));
        el.classList.add('selected');
        selectedTaskId = task.id;
      });

      el.addEventListener('dblclick', () => {
        if (task.outputPath) {
          window.api.openFolder(task.outputPath);
        } else {
          window.api.openFolder();
        }
      });

      list.appendChild(el);
    });
  }

  // ========== Conversion Runner ==========
  async function startAllTasks() {
    const queuedTasks = tasks.filter(t => t.status === 'queued');
    if (queuedTasks.length === 0) return;

    isConverting = true;
    startElapsedTimer();

    for (const task of queuedTasks) {
      if (!isConverting) break;
      task.status = 'converting';
      renderTasks();

      try {
        const result = await window.api.startConversion({
          id: task.id,
          type: task.type,
          input: task.input,
          options: task.options,
        });

        if (result.error) {
          task.status = 'failed';
          task.error = result.error;
        } else {
          task.status = 'completed';
          task.progress = 100;
          if (result.outputPath) task.outputPath = result.outputPath;
        }
      } catch (e) {
        task.status = 'failed';
        task.error = e.message;
      }

      renderTasks();
    }

    isConverting = false;
    stopElapsedTimer();

    // Check post conversion actions
    if (document.getElementById('chk-notify')?.checked) {
      const b = I18N[currentLang] || I18N.ar;
      new Notification('FormaLux', { body: b.notify_all_completed || 'All conversions completed successfully!' });
    }
    if (settings.openFolderAfter) {
      window.api.openFolder();
    }
  }

  function stopAllTasks() {
    isConverting = false;
    tasks.forEach(task => {
      if (task.status === 'converting') {
        window.api.cancelTask(task.id);
        task.status = 'cancelled';
      }
    });
    renderTasks();
    stopElapsedTimer();
  }

  function removeSelectedTask() {
    if (!selectedTaskId) return;
    tasks = tasks.filter(t => t.id !== selectedTaskId);
    selectedTaskId = null;
    renderTasks();
  }

  function clearAllTasks() {
    tasks.forEach(t => {
      if (t.status === 'converting') window.api.cancelTask(t.id);
    });
    tasks = [];
    selectedTaskId = null;
    renderTasks();
  }

  // ========== Task Listeners ==========
  function setupTaskListeners() {
    window.api.onTaskProgress((data) => {
      const task = tasks.find(t => t.id === data.taskId);
      if (task) {
        task.progress = data.progress;
        renderTasks();
      }
    });

    window.api.onTaskComplete((data) => {
      const task = tasks.find(t => t.id === data.taskId);
      if (task) {
        task.status = 'completed';
        task.progress = 100;
        if (data.outputPath) task.outputPath = data.outputPath;
        renderTasks();
      }
    });

    window.api.onTaskFailed((data) => {
      const task = tasks.find(t => t.id === data.taskId);
      if (task) {
        task.status = 'failed';
        task.error = data.error || (data.code ? `Exit code ${data.code}` : 'Failed');
        renderTasks();
      }
    });
  }

  // ========== Toolbar ==========
  function setupToolbar() {
    document.getElementById('btn-add-files-main')?.addEventListener('click', promptAddFilesMain);
    document.getElementById('empty-state')?.addEventListener('click', promptAddFilesMain);
    document.getElementById('btn-output-folder').addEventListener('click', async () => {
      await window.api.openFolder();
    });
    document.getElementById('btn-settings').addEventListener('click', () => openOptionsModal());
    document.getElementById('btn-remove').addEventListener('click', () => removeSelectedTask());
    document.getElementById('btn-clear').addEventListener('click', () => clearAllTasks());
    document.getElementById('btn-stop').addEventListener('click', () => stopAllTasks());
    document.getElementById('btn-start').addEventListener('click', () => startAllTasks());
  }

  // ========== Keyboard Shortcuts ==========
  function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'F5' || (e.ctrlKey && e.key === 'Enter')) {
        e.preventDefault();
        startAllTasks();
      } else if (e.key === 'Escape') {
        closeAllDropdowns();
        closeOptionsModal();
        closeToolModal();
        closeAboutModal();
        if (isConverting) stopAllTasks();
      } else if (e.key === 'Delete') {
        if (!e.target.matches('input, textarea')) {
          removeSelectedTask();
        }
      } else if (e.ctrlKey && (e.key === 'o' || e.key === 'O')) {
        e.preventDefault();
        window.api.openFolder();
      } else if (e.ctrlKey && e.key === ',') {
        e.preventDefault();
        openOptionsModal();
      }
    });
  }

  // ========== Modals Setup ==========
  function setupModals() {
    try {
      // Options modal
      document.getElementById('close-options')?.addEventListener('click', closeOptionsModal);
      document.getElementById('btn-cancel-options')?.addEventListener('click', closeOptionsModal);
      document.getElementById('btn-apply-options')?.addEventListener('click', applyOptions);
      document.getElementById('btn-ok-options')?.addEventListener('click', () => { applyOptions(); closeOptionsModal(); });

      // Options Tab switching
      document.querySelectorAll('.modal-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          const tabName = tab.dataset.tab;
          document.querySelectorAll('.modal-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tabName));
          document.querySelectorAll('.tab-content').forEach(c => c.classList.toggle('active', c.dataset.tab === tabName));
        });
      });

      // Output folder change
      document.getElementById('btn-change-output')?.addEventListener('click', async () => {
        const folder = await window.api.selectOutputFolder();
        if (folder) {
          document.getElementById('opt-output-dir').value = folder;
          updateOutputPathDisplay();
        }
      });

      // HA Test inside options
      document.getElementById('btn-ha-test')?.addEventListener('click', openHaTestModal);

      // Tool modal
      document.getElementById('close-tool-options')?.addEventListener('click', closeToolModal);
      document.getElementById('btn-cancel-tool')?.addEventListener('click', closeToolModal);
      document.getElementById('btn-add-files')?.addEventListener('click', addFilesToTool);
      document.getElementById('btn-confirm-tool')?.addEventListener('click', confirmTool);

      // About modal
      document.getElementById('close-about')?.addEventListener('click', closeAboutModal);
      document.getElementById('btn-close-about-ok')?.addEventListener('click', closeAboutModal);
      document.getElementById('about-btn-website')?.addEventListener('click', () => {
        alert('FormaLux v1.0.0 — Official Website: https://github.com/formalux');
      });

      // Click outside to close modals
      document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
          if (e.target === overlay) overlay.classList.add('hidden');
        });
      });
    } catch (e) {
      console.error('Error setting up base modals:', e);
    }

    // Format & Utilities Modals (safely isolated)
    try { setupFormatTaskModals(); } catch (e) { console.error('setupFormatTaskModals error:', e); }
    try { setupDocumentTaskModals(); } catch (e) { console.error('setupDocumentTaskModals error:', e); }
    try { setupDiscTaskModals(); } catch (e) { console.error('setupDiscTaskModals error:', e); }
    try { setupDvdIsoModal(); } catch (e) { console.error('setupDvdIsoModal error:', e); }
    try { setupCsoCompressModal(); } catch (e) { console.error('setupCsoCompressModal error:', e); }
    try { setupCdAudioModal(); } catch (e) { console.error('setupCdAudioModal error:', e); }
    try { setupDvdRipperModPrompt(); } catch (e) { console.error('setupDvdRipperModPrompt error:', e); }
    try { setupMediaInfoHandlers(); } catch (e) { console.error('setupMediaInfoHandlers error:', e); }
    try { setupRenameHandlers(); } catch (e) { console.error('setupRenameHandlers error:', e); }
    try { setupHaTestHandlers(); } catch (e) { console.error('setupHaTestHandlers error:', e); }
  }

  function openOptionsModal() {
    const modal = document.getElementById('options-modal');
    document.getElementById('opt-output-dir').value = settings.outputDir || '';
    document.getElementById('opt-same-folder').checked = settings.outputToSameFolder || false;
    document.getElementById('opt-sub-folder').checked = settings.outputToSubFolder || false;
    document.getElementById('opt-shutdown').checked = settings.shutdownAfter || false;
    document.getElementById('opt-open-folder').checked = settings.openFolderAfter || false;
    document.getElementById('opt-sound-general').checked = settings.soundGeneral || false;
    document.getElementById('opt-sound-complete').checked = settings.soundComplete || false;
    document.getElementById('opt-sound-fail').checked = settings.soundFail !== false;
    document.getElementById('opt-context-menu').checked = settings.addToContextMenu !== false;
    document.getElementById('opt-check-updates').checked = settings.checkUpdates !== false;
    const repoInp = document.getElementById('opt-github-repo');
    if (repoInp) repoInp.value = settings.githubRepo || 'mohammadfahmi2030/FormaLux';
    document.getElementById('opt-minimize-tray').checked = settings.minimizeToTray || false;
    document.getElementById('opt-gpu-auto').checked = settings.gpuAutoDetect !== false;
    document.getElementById('opt-multi-threads').checked = settings.multiThreads > 1;
    document.getElementById('opt-thread-count').value = settings.multiThreads || 8;
    document.getElementById('opt-show-usage').checked = settings.showCpuGpu !== false;
    document.getElementById('opt-jpg-quality').value = settings.jpgQuality || 90;
    document.getElementById('opt-webp-quality').value = settings.webpQuality || 90;
    modal.classList.remove('hidden');
  }

  function closeOptionsModal() {
    document.getElementById('options-modal').classList.add('hidden');
  }

  async function applyOptions() {
    settings.outputDir = document.getElementById('opt-output-dir').value;
    settings.outputToSameFolder = document.getElementById('opt-same-folder').checked;
    settings.outputToSubFolder = document.getElementById('opt-sub-folder').checked;
    settings.shutdownAfter = document.getElementById('opt-shutdown').checked;
    settings.openFolderAfter = document.getElementById('opt-open-folder').checked;
    settings.soundGeneral = document.getElementById('opt-sound-general').checked;
    settings.soundComplete = document.getElementById('opt-sound-complete').checked;
    settings.soundFail = document.getElementById('opt-sound-fail').checked;
    settings.addToContextMenu = document.getElementById('opt-context-menu').checked;
    settings.checkUpdates = document.getElementById('opt-check-updates').checked;
    const repoInp = document.getElementById('opt-github-repo');
    if (repoInp) settings.githubRepo = repoInp.value.trim() || 'mohammadfahmi2030/FormaLux';
    settings.minimizeToTray = document.getElementById('opt-minimize-tray').checked;
    settings.gpuAutoDetect = document.getElementById('opt-gpu-auto').checked;
    settings.multiThreads = parseInt(document.getElementById('opt-thread-count').value) || 8;
    settings.showCpuGpu = document.getElementById('opt-show-usage').checked;
    settings.jpgQuality = parseInt(document.getElementById('opt-jpg-quality').value) || 90;
    settings.webpQuality = parseInt(document.getElementById('opt-webp-quality').value) || 90;
    await window.api.saveSettings(settings);
    updateOutputPathDisplay();
  }

  async function triggerCheckForUpdates(manual = true) {
    const isAr = currentLang === 'ar';
    const repo = settings.githubRepo || 'mohammadfahmi2030/FormaLux';

    try {
      const res = await window.api.checkForUpdates(repo);
      if (res.hasUpdate) {
        const title = isAr ? '🎉 يتوفر إصدار جديد من FormaLux!' : '🎉 A new version of FormaLux is available!';
        const notes = res.releaseNotes ? (isAr ? '\n\nملاحظات الإصدار:\n' : '\n\nRelease Notes:\n') + res.releaseNotes : '';
        const promptTxt = isAr ? '\n\nهل تريد فتح صفحة التحميل الآن؟' : '\n\nWould you like to open the download page now?';
        const msg = `${title}\n${isAr ? 'الإصدار الحالي: ' : 'Current Version: '}v${res.currentVersion}\n${isAr ? 'الإصدار الجديد: ' : 'New Version: '}v${res.latestVersion}\n${isAr ? 'المستودع: ' : 'Repository: '}${res.repo}${notes}${promptTxt}`;
        
        if (confirm(msg)) {
          window.api.openExternalUrl(res.downloadUrl || res.releaseUrl);
        }
      } else {
        if (manual) {
          if (res.status === 'error') {
            alert(isAr ? `تعذر الاتصال بـ GitHub للتحقق من التحديثات:\n${res.error}` : `Failed to check for updates on GitHub:\n${res.error}`);
          } else if (res.status === 'invalid_repo') {
            alert(isAr ? `يرجى ضبط رابط مستودع GitHub في الإعدادات:\n${res.message}` : `Please configure GitHub repository in Settings:\n${res.message}`);
          } else if (res.status === 'no_release_yet') {
            alert(isAr ? `أنت تستخدم أحدث إصدار من FormaLux (v${res.currentVersion}) 👍\nالمستودع: ${res.repo}\n(لم تُنشر إصدارات Releases أحدث على GitHub بعد)` : `You are using the latest version of FormaLux (v${res.currentVersion}) 👍\nRepository: ${res.repo}\n(No newer releases published on GitHub yet)`);
          } else {
            alert(isAr ? `أنت تستخدم أحدث إصدار من FormaLux (v${res.currentVersion}) 👍\nلا توجد تحديثات جديدة حالياً.` : `You are using the latest version of FormaLux (v${res.currentVersion}) 👍\nNo updates available.`);
          }
        }
      }
    } catch (e) {
      if (manual) alert(isAr ? `خطأ أثناء التحقق من التحديثات: ${e.message}` : `Update check error: ${e.message}`);
    }
  }

  function openAboutModal() {
    const modal = document.getElementById('about-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
  }

  function closeAboutModal() {
    const modal = document.getElementById('about-modal');
    if (modal) modal.classList.add('hidden');
  }

  // =========================================================
  // UTILITIES 1: MEDIA FILE INFO MODAL
  // =========================================================
  let currentMediaInfoPath = '';

  function resetMediaInfoStats() {
    const ids = ['mi-stat-container', 'mi-stat-size', 'mi-stat-duration', 'mi-stat-video', 'mi-stat-audio'];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '--';
    });
    const badge = document.getElementById('mi-strip-badge');
    if (badge) badge.textContent = currentLang === 'ar' ? 'جاهز للعرض' : 'Ready';
  }

  function openMediaInfoModal(initialFilePath) {
    const modal = document.getElementById('media-info-modal');
    if (!modal) return;

    // Show immediately without any blocking delay
    modal.classList.remove('hidden');

    const b = I18N[currentLang] || I18N.ar;
    const pathInput = document.getElementById('media-info-path-input');
    const contentPre = document.getElementById('media-info-content');
    const copyText = document.getElementById('media-info-copy-text');

    if (copyText) copyText.textContent = b.btn_copy_clipboard || 'Copy to clipboard';

    if (initialFilePath) {
      loadMediaInfoForFile(initialFilePath);
    } else if (currentMediaInfoPath) {
      loadMediaInfoForFile(currentMediaInfoPath);
    } else {
      if (pathInput) pathInput.value = '';
      if (contentPre) {
        contentPre.textContent = currentLang === 'ar'
          ? 'اختر ملف وسائط من الأعلى أو اسحب وأفلت الملف هنا لعرض تقرير MediaInfo المفصل الشامل لكافة المسارات والبيانات الوصفية.'
          : 'Select a media file above or drag & drop a file here to inspect detailed MediaInfo.';
      }
      resetMediaInfoStats();
    }
  }

  function closeMediaInfoModal() {
    const modal = document.getElementById('media-info-modal');
    if (modal) modal.classList.add('hidden');
  }

  function formatDurationStr(sec) {
    if (!sec || isNaN(sec)) return '--';
    const s = Math.floor(sec);
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  function formatBytesStr(bytes) {
    if (!bytes || isNaN(bytes)) return '--';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1024) {
      return (mb / 1024).toFixed(2) + ' GB';
    }
    return mb.toFixed(1) + ' MB';
  }

  async function loadMediaInfoForFile(filePath) {
    if (!filePath) return;
    currentMediaInfoPath = filePath;
    const pathInput = document.getElementById('media-info-path-input');
    const contentPre = document.getElementById('media-info-content');
    const badge = document.getElementById('mi-strip-badge');

    if (pathInput) pathInput.value = filePath;
    if (contentPre) {
      contentPre.textContent = (currentLang === 'ar' ? 'جارٍ قراءة بيانات الوسائط وتحليل الحاويات...' : 'Reading media information and analyzing streams...');
    }
    if (badge) badge.textContent = currentLang === 'ar' ? 'جاري التحليل...' : 'Analyzing...';

    try {
      const res = await window.api.getMediaInfo(filePath);
      if (contentPre) {
        contentPre.textContent = (res && res.text) ? res.text : (currentLang === 'ar' ? 'تعذر استخراج بيانات الوسائط.' : 'Unable to extract media information.');
      }
      if (badge) badge.textContent = currentLang === 'ar' ? 'تم التحليل بنجاح ✓' : 'Analyzed ✓';

      // Update stat pills from raw ffprobe data
      if (res && res.raw) {
        const raw = res.raw;
        const fmt = raw.format || {};
        const streams = raw.streams || [];

        // Container
        const containerEl = document.getElementById('mi-stat-container');
        if (containerEl) {
          const ext = filePath.split(/[/\\]/).pop().split('.').pop().toUpperCase();
          const fmtName = (fmt.format_long_name || fmt.format_name || ext).split(',')[0].trim();
          containerEl.textContent = `${ext} (${fmtName})`;
        }

        // Size
        const sizeEl = document.getElementById('mi-stat-size');
        if (sizeEl) {
          sizeEl.textContent = formatBytesStr(parseInt(fmt.size));
        }

        // Duration
        const durEl = document.getElementById('mi-stat-duration');
        if (durEl) {
          durEl.textContent = formatDurationStr(parseFloat(fmt.duration));
        }

        // Video
        const vStream = streams.find(s => s.codec_type === 'video');
        const vEl = document.getElementById('mi-stat-video');
        if (vEl) {
          if (vStream) {
            const cName = (vStream.codec_name || '').toUpperCase();
            const resStr = (vStream.width && vStream.height) ? `${vStream.width}x${vStream.height}` : '';
            vEl.textContent = resStr ? `${cName} • ${resStr}` : cName;
          } else {
            vEl.textContent = currentLang === 'ar' ? 'لا يوجد فيديو' : 'No Video';
          }
        }

        // Audio
        const aStream = streams.find(s => s.codec_type === 'audio');
        const aEl = document.getElementById('mi-stat-audio');
        if (aEl) {
          if (aStream) {
            const cName = (aStream.codec_name || '').toUpperCase();
            const br = aStream.bit_rate ? `${Math.round(aStream.bit_rate / 1000)}k` : '';
            aEl.textContent = br ? `${cName} • ${br}` : cName;
          } else {
            aEl.textContent = currentLang === 'ar' ? 'لا يوجد صوت' : 'No Audio';
          }
        }
      }
    } catch (err) {
      if (contentPre) contentPre.textContent = `Error reading file: ${err.message || err}`;
      if (badge) badge.textContent = currentLang === 'ar' ? 'خطأ في التحليل' : 'Analysis Error';
    }
  }

  function setupMediaInfoHandlers() {
    const closeBtn = document.getElementById('close-media-info-modal');
    const okBtn = document.getElementById('media-info-btn-ok');
    const browseBtn = document.getElementById('media-info-btn-browse');
    const copyBtn = document.getElementById('media-info-btn-copy');
    const openFolderBtn = document.getElementById('media-info-btn-open-folder');
    const modal = document.getElementById('media-info-modal');

    if (closeBtn) closeBtn.addEventListener('click', closeMediaInfoModal);
    if (okBtn) okBtn.addEventListener('click', closeMediaInfoModal);

    if (openFolderBtn) {
      openFolderBtn.addEventListener('click', () => {
        if (currentMediaInfoPath) {
          window.api.openFolder(currentMediaInfoPath);
        }
      });
    }

    if (browseBtn) {
      browseBtn.addEventListener('click', async () => {
        const file = await window.api.selectSingleFile([
          { name: 'All Media & Files (*.*)', extensions: ['*'] }
        ]);
        if (file) {
          loadMediaInfoForFile(file);
        }
      });
    }

    const pathInput = document.getElementById('media-info-path-input');
    if (pathInput) {
      pathInput.style.cursor = 'pointer';
      pathInput.addEventListener('click', () => browseBtn?.click());
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        const contentPre = document.getElementById('media-info-content');
        const copyText = document.getElementById('media-info-copy-text');
        const b = I18N[currentLang] || I18N.ar;
        if (!contentPre || !contentPre.textContent) return;

        try {
          await navigator.clipboard.writeText(contentPre.textContent);
          if (copyText) {
            const original = copyText.textContent;
            copyText.textContent = `✓ ${b.copied_to_clipboard || 'تم النسخ!'}`;
            setTimeout(() => { copyText.textContent = original; }, 2000);
          }
        } catch (e) {
          console.error('Clipboard copy error:', e);
        }
      });
    }

    // Drag and drop onto modal
    if (modal) {
      modal.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
      modal.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          const droppedFile = e.dataTransfer.files[0];
          const fullPath = window.api.getPathForFile ? window.api.getPathForFile(droppedFile) : droppedFile.path;
          if (fullPath) loadMediaInfoForFile(fullPath);
        }
      });
    }
  }

  // =========================================================
  // UTILITIES 2: BATCH FILE RENAMER MODAL
  // =========================================================
  let currentRenameFolder = '';

  function openRenameModal() {
    const modal = document.getElementById('rename-modal');
    if (!modal) return;

    // Show immediately without any blocking
    modal.classList.remove('hidden');

    const folderInput = document.getElementById('rename-folder-input');
    if (!currentRenameFolder && settings && settings.outputDir) {
      currentRenameFolder = settings.outputDir;
    }
    if (folderInput) folderInput.value = currentRenameFolder || '';

    // Asynchronously update preview to prevent any UI freeze
    setTimeout(() => {
      updateRenamePreview();
    }, 10);
  }

  function closeRenameModal() {
    const modal = document.getElementById('rename-modal');
    if (modal) modal.classList.add('hidden');
  }

  function getRenameOptionsFromUI() {
    const folderInput = document.getElementById('rename-folder-input');
    const fileType = document.getElementById('rename-file-type')?.value || 'picture';
    const entireTree = document.getElementById('rename-entire-tree')?.checked || false;
    const pattern = document.getElementById('rename-pattern')?.value || '[Date][Number]';
    const delimiter = document.getElementById('rename-delimiter')?.value !== undefined ? document.getElementById('rename-delimiter').value : ' ';
    const startNumber = parseInt(document.getElementById('rename-start-num')?.value) || 1;
    const dateFormat = document.getElementById('rename-date-format')?.value || 'YYYY-MM-DD';
    const timeFormat = document.getElementById('rename-time-format')?.value || 'None';
    const dateType = document.querySelector('input[name="rename-date-type"]:checked')?.value || 'photo_date';
    const removeString = document.getElementById('rename-remove-string')?.value || '';
    const ignoreDateTime = document.getElementById('rename-ignore-dt')?.checked ?? true;

    return {
      folderPath: folderInput?.value || '',
      fileType,
      entireTree,
      pattern,
      delimiter,
      startNumber,
      dateFormat,
      timeFormat,
      dateType,
      removeString,
      ignoreDateTime
    };
  }

  async function updateRenamePreview() {
    const previewEl = document.getElementById('rename-live-preview');
    if (!previewEl) return;

    const opts = getRenameOptionsFromUI();

    if (opts.folderPath) {
      try {
        const res = await window.api.batchRenamePreview(opts);
        if (res && res.success && res.totalFiles > 0) {
          previewEl.textContent = `${res.samplePreview || ''} (${res.totalFiles} files detected)`;
          return;
        }
      } catch (e) {}
    }

    // Default simulated sample if no real files in folder
    const ext = opts.fileType === 'picture' ? '.jpg' : (opts.fileType === 'video' ? '.mp4' : (opts.fileType === 'audio' ? '.mp3' : '.dat'));
    const now = new Date();
    const y = now.getFullYear();
    const m = (now.getMonth() + 1).toString().padStart(2, '0');
    const d = now.getDate().toString().padStart(2, '0');
    let dateStr = `${y}-${m}-${d}`;
    if (opts.dateFormat === 'YYYYMMDD') dateStr = `${y}${m}${d}`;
    else if (opts.dateFormat === 'YYYY.MM.DD') dateStr = `${y}.${m}.${d}`;
    else if (opts.dateFormat === 'DD-MM-YYYY') dateStr = `${d}-${m}-${y}`;
    else if (opts.dateFormat === 'MM-DD-YYYY') dateStr = `${m}-${d}-${y}`;
    else if (opts.dateFormat === 'None') dateStr = '';

    const numStr = (opts.startNumber || 1).toString();
    const delim = opts.delimiter;
    let sampleNew = '';
    if (opts.pattern === '[Date][Number]') sampleNew = dateStr ? `${dateStr}${delim}${numStr}` : numStr;
    else if (opts.pattern === '[OriginalName][Number]') sampleNew = `MySample${delim}${numStr}`;
    else if (opts.pattern === '[Number]') sampleNew = numStr;
    else if (opts.pattern === '[Date][OriginalName]') sampleNew = dateStr ? `${dateStr}${delim}MySample` : 'MySample';
    else if (opts.pattern === '[OriginalName][Date]') sampleNew = dateStr ? `MySample${delim}${dateStr}` : 'MySample';
    else sampleNew = `File${delim}${numStr}`;

    previewEl.textContent = `MySample${ext} -> ${sampleNew}${ext}`;
  }

  async function executeBatchRename() {
    const opts = getRenameOptionsFromUI();
    const b = I18N[currentLang] || I18N.ar;

    if (!opts.folderPath) {
      alert(b.alert_no_files || 'Please select a target folder first.');
      return;
    }

    const btn = document.getElementById('btn-execute-rename');
    if (btn) btn.disabled = true;

    try {
      const res = await window.api.batchRenameExecute(opts);
      if (res && res.success) {
        if (res.count === 0) {
          alert(b.rename_no_files || 'No matching files found to rename.');
        } else {
          const msg = (b.rename_success || 'Successfully renamed {count} files!').replace('{count}', res.count);
          alert(msg);
          updateRenamePreview();
        }
      } else {
        alert('Rename error: ' + (res.errors?.[0]?.error || 'Unknown error'));
      }
    } catch (e) {
      alert('Rename error: ' + e.message);
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  function setupRenameHandlers() {
    const closeBtn = document.getElementById('close-rename-modal');
    const cancelBtn = document.getElementById('close-rename-cancel-btn');
    const browseBtn = document.getElementById('rename-btn-browse');
    const executeBtn = document.getElementById('btn-execute-rename');

    if (closeBtn) closeBtn.addEventListener('click', closeRenameModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeRenameModal);

    if (browseBtn) {
      browseBtn.addEventListener('click', async () => {
        const folder = await window.api.selectFolder();
        if (folder) {
          currentRenameFolder = folder;
          const input = document.getElementById('rename-folder-input');
          if (input) input.value = folder;
          updateRenamePreview();
        }
      });
    }

    const folderInput = document.getElementById('rename-folder-input');
    if (folderInput) {
      folderInput.style.cursor = 'pointer';
      folderInput.addEventListener('click', () => browseBtn?.click());
    }

    if (executeBtn) executeBtn.addEventListener('click', executeBatchRename);

    // Live update on input changes
    const inputsToWatch = [
      'rename-file-type',
      'rename-entire-tree',
      'rename-pattern',
      'rename-delimiter',
      'rename-start-num',
      'rename-date-format',
      'rename-time-format',
      'rename-remove-string',
      'rename-ignore-dt'
    ];
    inputsToWatch.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('change', updateRenamePreview);
        el.addEventListener('input', updateRenamePreview);
      }
    });

    document.querySelectorAll('input[name="rename-date-type"]').forEach(r => {
      r.addEventListener('change', updateRenamePreview);
    });
  }

  // =========================================================
  // UTILITIES 3: HARDWARE ACCELERATION TESTING MODAL
  // =========================================================
  function openHaTestModal() {
    const modal = document.getElementById('ha-test-modal');
    if (!modal) return;

    // Show immediately without delay
    modal.classList.remove('hidden');

    const list = document.getElementById('ha-test-list');
    const badge = document.getElementById('ha-supported-count');
    if (badge) badge.textContent = '--';
    const b = I18N[currentLang] || I18N.ar;

    if (list) {
      list.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 36px 20px;">
          <div class="ha-spinner-pro"></div>
          <p style="margin-top: 14px; font-size: 13px; font-weight: 600; color: #38bdf8;">${b.ha_probing || 'جاري فحص وتجربة تشفير العتاد بواسطة FFmpeg...'}</p>
        </div>
      `;
    }

    runHardwareProbe();
  }

  function closeHaTestModal() {
    const modal = document.getElementById('ha-test-modal');
    if (modal) modal.classList.add('hidden');
  }

  async function runHardwareProbe() {
    const list = document.getElementById('ha-test-list');
    const countBadge = document.getElementById('ha-supported-count');
    const descEl = document.getElementById('ha-summary-desc');
    const pulseEl = document.getElementById('ha-pulse-indicator');

    if (pulseEl) pulseEl.style.background = '#eab308';
    if (descEl) descEl.textContent = currentLang === 'ar' ? 'جاري فحص وتجربة تشفير العتاد بواسطة FFmpeg...' : 'Testing hardware acceleration with FFmpeg...';

    try {
      const results = await window.api.testHardwareAcceleration();
      if (!list) return;

      const supportedCount = results.filter(r => r.supported).length;
      if (countBadge) countBadge.textContent = `${supportedCount} / ${results.length}`;
      if (pulseEl) pulseEl.style.background = supportedCount > 0 ? '#22c55e' : '#ef4444';

      if (descEl) {
        if (currentLang === 'ar') {
          descEl.textContent = supportedCount > 0
            ? `تم اكتشاف ${supportedCount} مسرع عتاد متوافق مع نظامك ومتاح للتحويل فائق السرعة.`
            : 'لم يتم العثور على مسرع متوافق، سيتم التحويل عبر المعالج الأساسي (CPU) بأعلى جودة.';
        } else {
          descEl.textContent = supportedCount > 0
            ? `Found ${supportedCount} hardware encoder(s) supported on your system.`
            : 'No hardware encoder supported. Standard CPU processing will be used.';
        }
      }

      list.innerHTML = results.map(r => {
        let vendor = 'Hardware';
        let vendorClass = 'ha-vendor-generic';
        if (r.name.startsWith('NV')) {
          vendor = 'NVIDIA';
          vendorClass = 'ha-vendor-nvidia';
        } else if (r.name.startsWith('AMF')) {
          vendor = 'AMD';
          vendorClass = 'ha-vendor-amd';
        } else if (r.name.startsWith('Intel')) {
          vendor = 'Intel';
          vendorClass = 'ha-vendor-intel';
        } else if (r.name.startsWith('MF')) {
          vendor = 'Microsoft';
          vendorClass = 'ha-vendor-ms';
        }

        return `
          <div class="ha-card-pro ${r.supported ? 'supported' : 'unsupported'}" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; border-radius: 8px; background: ${r.supported ? 'rgba(34, 197, 94, 0.06)' : 'rgba(255, 255, 255, 0.02)'}; border: 1px solid ${r.supported ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 255, 255, 0.06)'};">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span class="ha-vendor-chip ${vendorClass}" style="padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 700;">${vendor}</span>
              <div style="display: flex; align-items: baseline; gap: 8px;">
                <span class="ha-codec-name" style="font-size: 13.5px; font-weight: 700; color: #f8fafc;">${r.name}</span>
                <span class="ha-encoder-tag" style="font-family: monospace; font-size: 11.5px; color: #94a3b8;">${r.encoder || ''}</span>
              </div>
            </div>
            <div>
              <span class="ha-status-badge ${r.supported ? 'supported' : 'unsupported'}">
                ${r.supported ? (currentLang === 'ar' ? '✓ مدعوم' : 'Supported ✓') : (currentLang === 'ar' ? '✕ غير مدعوم' : '✕ Unsupported')}
              </span>
            </div>
          </div>
        `;
      }).join('');
    } catch (e) {
      if (list) {
        list.innerHTML = `<div style="grid-column: 1 / -1; color: #ef4444; padding: 14px; text-align: center;">Error probing encoders: ${e.message || e}</div>`;
      }
      if (pulseEl) pulseEl.style.background = '#ef4444';
    }
  }

  function setupHaTestHandlers() {
    const closeBtn = document.getElementById('close-ha-test-modal');
    const okBtn = document.getElementById('btn-close-ha-ok');
    const retestBtn = document.getElementById('ha-btn-retest');

    if (closeBtn) closeBtn.addEventListener('click', closeHaTestModal);
    if (okBtn) okBtn.addEventListener('click', closeHaTestModal);
    if (retestBtn) retestBtn.addEventListener('click', () => {
      openHaTestModal();
    });
  }

  async function playMediaWithSystem() {
    const files = await window.api.selectFiles();
    if (files && files[0]) {
      window.api.openFolder(files[0]);
    }
  }

  function resetSettings() {
    settings = {
      outputDir: 'D:\\FLoutput',
      language: 'ar',
      theme: 'default',
      multiThreads: 8,
      gpuAutoDetect: true,
      jpgQuality: 90,
      webpQuality: 90,
    };
    window.api.saveSettings(settings);
    applyTheme('default', false);
    applyLanguage('ar', false);
    updateOutputPathDisplay();
    const b = I18N[currentLang] || I18N.ar;
    alert(b.alert_reset_done);
  }

  // ========== Drag & Drop ==========
  function setupDragDrop() {
    const body = document.body;

    ['dragenter', 'dragover'].forEach(event => {
      body.addEventListener(event, (e) => {
        e.preventDefault();
        body.classList.add('drag-over');
      });
    });

    ['dragleave', 'drop'].forEach(event => {
      body.addEventListener(event, (e) => {
        e.preventDefault();
        body.classList.remove('drag-over');
      });
    });

    body.addEventListener('drop', (e) => {
      e.preventDefault();
      body.classList.remove('drag-over');
      const files = Array.from(e.dataTransfer.files).map(f => {
        if (window.api && window.api.getPathForFile) {
          const p = window.api.getPathForFile(f);
          if (p) return p;
        }
        return f.path;
      }).filter(Boolean);

      if (files.length > 0) {
        const ftModal = document.getElementById('format-task-modal');
        if (ftModal && !ftModal.classList.contains('hidden')) {
          addFilesToFormatTask(files);
        } else if (currentToolType) {
          currentToolFiles.push(...files);
          renderModalFiles();
        } else {
          handleFilesSelected(files);
        }
      }
    });
  }

  async function promptAddFilesMain() {
    const files = await window.api.selectFiles();
    if (files && files.length > 0) {
      handleFilesSelected(files);
    }
  }

  function handleFilesSelected(files) {
    if (!files || files.length === 0) return;

    // Detect format from first file
    const ext = (files[0].split('.').pop() || '').toLowerCase();
    let detectedTool = 'v_mp4';

    const videoExts = ['mp4', 'mkv', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mpg', '3gp', 'ts', 'm4v', 'vob'];
    const audioExts = ['mp3', 'wav', 'flac', 'm4a', 'wma', 'ogg', 'aac', 'opus', 'ac3'];
    const imageExts = ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif', 'tif', 'tiff', 'ico', 'tga'];
    const docExts = ['pdf', 'docx', 'doc', 'txt', 'epub', 'mobi', 'azw3'];
    const discExts = ['iso', 'cso'];

    if (videoExts.includes(ext)) {
      detectedTool = 'v_mp4';
      setActiveSection('video');
      openFormatTaskModal(detectedTool, files);
    } else if (audioExts.includes(ext)) {
      detectedTool = 'a_mp3';
      setActiveSection('audio');
      openFormatTaskModal(detectedTool, files);
    } else if (imageExts.includes(ext)) {
      detectedTool = (ext === 'png') ? 'i_jpg' : 'i_png';
      setActiveSection('image');
      openFormatTaskModal(detectedTool, files);
    } else if (docExts.includes(ext)) {
      detectedTool = (ext === 'pdf') ? 'd_pdf_compress' : 'd_docx_pdf';
      setActiveSection('document');
      currentToolType = detectedTool;
      currentToolFiles = [...files];
      openToolModal(detectedTool);
      renderModalFiles();
    } else if (discExts.includes(ext)) {
      detectedTool = 'disc_iso_cso';
      setActiveSection('disc');
      openFormatTaskModal(detectedTool, files);
    } else {
      detectedTool = 'v_mp4';
      setActiveSection('video');
      openFormatTaskModal(detectedTool, files);
    }
  }

  // =========================================================
  // FORMAT FACTORY-STYLE FORMAT TASK & SETTING MODALS ENGINE
  // =========================================================

  function isFormatConversionTool(toolType) {
    if (!toolType) return false;
    const nonFormat = ['util_ha_test', 'v_player', 'v_record', 'v_download', 'a_tts'];
    if (nonFormat.includes(toolType)) return false;
    return toolType.startsWith('v_') || toolType.startsWith('a_') || toolType.startsWith('i_') || toolType === 'disc_iso_cso';
  }

  function getMediaTypeForTool(toolType) {
    if (!toolType) return 'video';
    if (toolType.startsWith('v_')) return 'video';
    if (toolType.startsWith('a_')) return 'audio';
    if (toolType.startsWith('i_')) return 'image';
    if (toolType === 'disc_iso_cso') return 'disc';
    return 'video';
  }

  function setupFormatTaskModals() {
    // Format Task Window Controls
    document.getElementById('ft-btn-close')?.addEventListener('click', closeFormatTaskModal);
    document.getElementById('ft-btn-output-setting')?.addEventListener('click', openSettingModal);
    document.getElementById('ft-btn-quick-preset')?.addEventListener('click', openMultiProfilesModal);

    // Subtabs: Files, Preview, Media Info
    document.querySelectorAll('.format-subtab').forEach(tab => {
      tab.addEventListener('click', () => {
        const subtab = tab.dataset.subtab;
        switchFormatSubtab(subtab);
      });
    });

    // Add Files (empty state center and bottom bar)
    document.getElementById('ft-center-add-files')?.addEventListener('click', promptAddFilesToFormatTask);
    document.getElementById('ft-btn-bottom-add-files')?.addEventListener('click', promptAddFilesToFormatTask);

    // Add Folder
    document.getElementById('ft-btn-add-folder')?.addEventListener('click', promptAddFolderToFormatTask);

    // Add Music (for video)
    document.getElementById('ft-btn-add-music')?.addEventListener('click', promptAddMusicToVideo);

    // Reorder and delete
    document.getElementById('ft-btn-move-up')?.addEventListener('click', () => moveSelectedFormatFile(-1));
    document.getElementById('ft-btn-move-down')?.addEventListener('click', () => moveSelectedFormatFile(1));
    document.getElementById('ft-btn-remove-selected')?.addEventListener('click', removeSelectedFormatFile);

    // Select All checkbox
    document.getElementById('ft-chk-select-all')?.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      formatFiles.forEach(f => f.checked = isChecked);
      document.querySelectorAll('.ft-row-chk').forEach(c => c.checked = isChecked);
    });

    // Browse Output Directory
    document.getElementById('ft-btn-browse-output')?.addEventListener('click', async () => {
      const folder = await window.api.selectOutputFolder();
      if (folder) {
        document.getElementById('ft-output-dir-input').value = folder;
        updateOutputPathDisplay();
      }
    });

    // OK Button: confirm format task
    document.getElementById('ft-btn-ok')?.addEventListener('click', confirmFormatTask);

    // Format Files Table Delegated Events (Delete X, Divide, Option/Clip, Selection)
    const ftTbody = document.getElementById('ft-files-tbody');
    ftTbody?.addEventListener('click', (e) => {
      const delBtn = e.target.closest('.ft-row-del');
      if (delBtn) {
        e.stopPropagation();
        const idx = parseInt(delBtn.dataset.idx, 10);
        deleteFormatFile(idx);
        return;
      }

      const divBtn = e.target.closest('.ft-btn-divide');
      if (divBtn) {
        e.stopPropagation();
        const idx = parseInt(divBtn.dataset.idx, 10);
        openDivideModal(idx);
        return;
      }

      const optBtn = e.target.closest('.ft-btn-option');
      if (optBtn) {
        e.stopPropagation();
        const idx = parseInt(optBtn.dataset.idx, 10);
        openClipModal(idx);
        return;
      }

      const chk = e.target.closest('.ft-row-chk');
      if (chk) {
        const idx = parseInt(chk.dataset.idx, 10);
        if (formatFiles[idx]) {
          formatFiles[idx].checked = chk.checked;
        }
        return;
      }

      const tr = e.target.closest('tr');
      if (tr && tr.dataset.idx !== undefined) {
        selectFormatFile(parseInt(tr.dataset.idx, 10));
      }
    });

    // Sub-modals & Context Menus Initialization
    initDivideModal();
    initClipModal();
    initContextMenus();
    initMultiProfilesModal();

    // ================= Video Setting Modal Controls =================
    document.getElementById('vs-btn-close')?.addEventListener('click', () => {
      document.getElementById('video-setting-modal').classList.add('hidden');
    });
    document.getElementById('vs-btn-cancel')?.addEventListener('click', () => {
      document.getElementById('video-setting-modal').classList.add('hidden');
    });
    document.getElementById('vs-btn-default')?.addEventListener('click', () => {
      setSelectVal('vs-preset-select', 'optimum');
      onVideoPresetChange('optimum');
    });
    document.getElementById('vs-preset-select')?.addEventListener('change', (e) => {
      onVideoPresetChange(e.target.value);
    });
    document.querySelectorAll('#video-setting-modal .setting-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;
        document.querySelectorAll('#video-setting-modal .setting-tab').forEach(t => t.classList.toggle('active', t === tab));
        document.querySelectorAll('#video-setting-modal .tab-pane').forEach(p => {
          const isActive = (p.id === `pane-${targetTab}`);
          p.classList.toggle('active', isActive);
          p.classList.toggle('hidden', !isActive);
        });
      });
    });
    document.getElementById('vs-btn-save-as')?.addEventListener('click', () => {
      const name = prompt(currentLang === 'ar' ? 'أدخل اسم القالب المخصص:' : 'Enter custom preset name:', currentPresetName);
      if (name && name.trim()) {
        currentPresetName = name.trim();
        currentPresetKey = 'custom';
        const sel = document.getElementById('vs-preset-select');
        if (sel) sel.value = 'custom';
        updatePresetDisplays();
      }
    });
    document.getElementById('vs-btn-ok')?.addEventListener('click', applyVideoSettings);

    // Subtitle File Browse
    document.getElementById('vs-btn-sub-browse')?.addEventListener('click', async () => {
      const files = await window.api.selectFiles([{ name: 'Subtitle Files', extensions: ['srt', 'ass', 'ssa', 'vtt', 'sub'] }]);
      if (files && files[0]) {
        const inp = document.getElementById('vs-opt-subtitle-path');
        if (inp) inp.value = files[0];
        currentFormatOptions.subtitlePath = files[0];
      }
    });

    // Subtitle Color Pickers
    document.getElementById('vs-opt-sub-fontcolor')?.addEventListener('input', (e) => {
      const lbl = document.getElementById('vs-lbl-sub-fontcolor');
      if (lbl) lbl.textContent = hexToRgbLabel(e.target.value);
    });
    document.getElementById('vs-opt-sub-outlinecolor')?.addEventListener('input', (e) => {
      const lbl = document.getElementById('vs-lbl-sub-outlinecolor');
      if (lbl) lbl.textContent = hexToRgbLabel(e.target.value);
    });

    // Watermark Controls
    document.getElementById('vs-opt-wm-type')?.addEventListener('change', (e) => {
      const isText = e.target.value === 'Text';
      const rowImg = document.getElementById('vs-row-wm-image');
      const rowTxt = document.getElementById('vs-row-wm-text');
      if (rowImg) rowImg.style.display = isText ? 'none' : '';
      if (rowTxt) rowTxt.style.display = isText ? '' : 'none';
    });

    document.getElementById('vs-btn-wm-browse')?.addEventListener('click', async () => {
      const files = await window.api.selectFiles([{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp', 'bmp', 'svg'] }]);
      if (files && files[0]) {
        const inp = document.getElementById('vs-opt-watermark-path');
        if (inp) inp.value = files[0];
        currentFormatOptions.watermarkPath = files[0];
        const en = document.getElementById('vs-opt-wm-enable');
        if (en) en.value = 'Yes';
      }
    });

    document.getElementById('vs-btn-add-watermark')?.addEventListener('click', () => {
      document.getElementById('vs-btn-wm-browse')?.click();
    });

    // Faststart sync with Other faststart
    document.getElementById('vs-opt-2pass')?.addEventListener('change', (e) => {
      setSelectVal('vs-opt-2pass-other', e.target.value);
    });
    document.getElementById('vs-opt-2pass-other')?.addEventListener('change', (e) => {
      setSelectVal('vs-opt-2pass', e.target.value);
    });

    // Mark as custom when any individual video setting changes
    document.querySelectorAll('#video-setting-modal select, #video-setting-modal input').forEach(s => {
      if (s.id !== 'vs-preset-select') {
        s.addEventListener('input', () => {
          const sel = document.getElementById('vs-preset-select');
          if (sel) sel.value = 'custom';
          currentPresetKey = 'custom';
          currentPresetName = 'Custom';
        });
      }
    });

    // ================= Audio Setting Modal Controls =================
    document.getElementById('as-btn-close')?.addEventListener('click', () => {
      document.getElementById('audio-setting-modal').classList.add('hidden');
    });
    document.getElementById('as-btn-cancel')?.addEventListener('click', () => {
      document.getElementById('audio-setting-modal').classList.add('hidden');
    });
    document.getElementById('as-btn-default')?.addEventListener('click', () => {
      setSelectVal('as-preset-select', 'high');
      onAudioPresetChange('high');
    });
    document.getElementById('as-preset-select')?.addEventListener('change', (e) => {
      onAudioPresetChange(e.target.value);
    });
    document.querySelectorAll('#audio-setting-modal .setting-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;
        document.querySelectorAll('#audio-setting-modal .setting-tab').forEach(t => t.classList.toggle('active', t === tab));
        document.querySelectorAll('#audio-setting-modal .tab-pane').forEach(p => {
          const isActive = (p.id === `pane-${targetTab}`);
          p.classList.toggle('active', isActive);
          p.classList.toggle('hidden', !isActive);
        });
      });
    });
    document.getElementById('as-btn-save-as')?.addEventListener('click', () => {
      const name = prompt(currentLang === 'ar' ? 'أدخل اسم القالب المخصص:' : 'Enter custom preset name:', currentPresetName);
      if (name && name.trim()) {
        currentPresetName = name.trim();
        currentPresetKey = 'custom';
        const sel = document.getElementById('as-preset-select');
        if (sel) sel.value = 'custom';
        updatePresetDisplays();
      }
    });
    document.getElementById('as-btn-ok')?.addEventListener('click', applyAudioSettings);

    // Mark as custom when any audio select changes
    document.querySelectorAll('#audio-setting-modal select').forEach(s => {
      if (s.id !== 'as-preset-select') {
        s.addEventListener('change', () => {
          const sel = document.getElementById('as-preset-select');
          if (sel) sel.value = 'custom';
          currentPresetKey = 'custom';
          currentPresetName = 'Custom';
        });
      }
    });

    // ================= Picture Setting Modal Controls =================
    document.getElementById('ps-btn-close')?.addEventListener('click', () => {
      document.getElementById('picture-setting-modal').classList.add('hidden');
    });
    document.getElementById('ps-btn-cancel')?.addEventListener('click', () => {
      document.getElementById('picture-setting-modal').classList.add('hidden');
    });
    document.getElementById('ps-btn-default')?.addEventListener('click', () => {
      setSelectVal('ps-preset-select', 'original');
      onPicturePresetChange('original');
    });
    document.getElementById('ps-preset-select')?.addEventListener('change', (e) => {
      onPicturePresetChange(e.target.value);
    });
    document.getElementById('ps-btn-save-as')?.addEventListener('click', () => {
      const name = prompt(currentLang === 'ar' ? 'أدخل اسم القالب المخصص:' : 'Enter custom preset name:', currentPresetName);
      if (name && name.trim()) {
        currentPresetName = name.trim();
        currentPresetKey = 'custom';
        const sel = document.getElementById('ps-preset-select');
        if (sel) sel.value = 'custom';
        updatePresetDisplays();
      }
    });
    document.getElementById('ps-btn-ok')?.addEventListener('click', applyPictureSettings);

    // ================= Video Subtitle & Watermark Browse =================
    document.getElementById('vs-btn-browse-subtitle')?.addEventListener('click', async () => {
      const files = await window.api.selectFiles([{ name: 'Subtitle Files', extensions: ['srt', 'ass', 'vtt', 'sub'] }]);
      if (files && files[0]) {
        document.getElementById('vs-opt-subtitle-path').value = files[0];
        currentFormatOptions.subtitlePath = files[0];
      }
    });

    document.getElementById('vs-btn-browse-watermark')?.addEventListener('click', async () => {
      const files = await window.api.selectFiles([{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp'] }]);
      if (files && files[0]) {
        document.getElementById('vs-opt-watermark-path').value = files[0];
        currentFormatOptions.watermarkPath = files[0];
        const chk = document.getElementById('vs-opt-watermark-enable');
        if (chk) chk.checked = true;
      }
    });

    // ================= Picture Watermark Browse =================
    document.getElementById('ps-btn-watermark')?.addEventListener('click', async () => {
      const files = await window.api.selectFiles([{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp'] }]);
      if (files && files[0]) {
        currentFormatOptions.watermarkPath = files[0];
        alert(currentLang === 'ar' ? `تم تحديد صورة العلامة المائية:\n${files[0].split(/[/\\]/).pop()}` : `Watermark image selected:\n${files[0].split(/[/\\]/).pop()}`);
      }
    });
  }

  function openFormatTaskModal(toolType, initialFiles = []) {
    currentFormatTool = toolType;
    currentMediaType = getMediaTypeForTool(toolType);
    const def = TOOL_DEFS[toolType] || { name: toolType.toUpperCase(), ext: '.mp4' };

    // Set Window Title
    const titleEl = document.getElementById('ft-window-title');
    const iconEl = document.getElementById('ft-window-icon');
    if (titleEl) {
      if (toolType === 'disc_iso_cso') {
        titleEl.textContent = 'ISO <--> CSO';
      } else {
        let displayName = def.name || toolType.toUpperCase();
        if (!displayName.startsWith('->') && !displayName.startsWith('→')) {
          displayName = `-> ${displayName}`;
        }
        titleEl.textContent = displayName.replace('→', '->');
      }
    }
    if (iconEl) {
      iconEl.textContent = toolType === 'disc_iso_cso' ? '💿' : currentMediaType === 'video' ? '🎬' : currentMediaType === 'audio' ? '🎵' : '🖼️';
    }

    // Set Category Badge
    const badgeText = document.getElementById('ft-badge-text');
    const badgeIcon = document.getElementById('ft-badge-icon');
    if (badgeText) {
      badgeText.textContent = toolType === 'disc_iso_cso' ? 'ISO / CSO' : currentMediaType === 'video' ? 'Video' : currentMediaType === 'audio' ? 'Audio' : 'Picture';
    }
    if (badgeIcon) {
      if (toolType === 'disc_iso_cso') {
        badgeIcon.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/></svg>`;
      } else if (currentMediaType === 'video') {
        badgeIcon.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="3" width="19" height="18" rx="2.5"/><line x1="7.5" y1="3" x2="7.5" y2="21"/><line x1="16.5" y1="3" x2="16.5" y2="21"/><line x1="2.5" y1="12" x2="21.5" y2="12"/></svg>`;
      } else if (currentMediaType === 'audio') {
        badgeIcon.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V6l12-2.5v12.5"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`;
      } else if (currentMediaType === 'picture') {
        badgeIcon.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ec4899" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3.5" width="18" height="17" rx="2.5"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10.5 5 20.5"/></svg>`;
      } else if (currentMediaType === 'doc' || currentMediaType === 'document') {
        badgeIcon.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`;
      } else {
        badgeIcon.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/></svg>`;
      }
    }

    // Initialize Default Presets & Options
    const mBtn = document.getElementById('ft-btn-add-music');
    const qBtn = document.getElementById('ft-btn-quick-preset');
    if (toolType === 'disc_iso_cso') {
      currentPresetKey = 'cso_lvl5';
      currentPresetName = 'CSO Compress Level 5';
      currentFormatOptions = { csoCompressLevel: 5 };
      if (mBtn) mBtn.style.display = 'none';
      if (qBtn) qBtn.style.display = 'none';
    } else if (currentMediaType === 'video') {
      currentPresetKey = 'optimum';
      currentPresetName = VIDEO_PRESETS.optimum.name;
      currentFormatOptions = { ...VIDEO_PRESETS.optimum };
      if (mBtn) mBtn.style.display = 'inline-flex';
      if (qBtn) qBtn.style.display = 'inline-flex';
    } else if (currentMediaType === 'audio') {
      currentPresetKey = 'high';
      currentPresetName = AUDIO_PRESETS.high.name;
      currentFormatOptions = { ...AUDIO_PRESETS.high };
      if (mBtn) mBtn.style.display = 'none';
      if (qBtn) qBtn.style.display = 'inline-flex';
    } else {
      currentPresetKey = 'original';
      currentPresetName = PICTURE_PRESETS.original.name;
      currentFormatOptions = { ...PICTURE_PRESETS.original };
      if (mBtn) mBtn.style.display = 'none';
      if (qBtn) qBtn.style.display = 'inline-flex';
    }

    // Update Banner Preset Display
    updatePresetDisplays();

    // Output Directory
    const outInput = document.getElementById('ft-output-dir-input');
    if (outInput) {
      outInput.value = settings.outputDir || 'D:\\FLoutput';
    }

    // Reset Files
    formatFiles = [];
    selectedFormatFileIndex = -1;
    selectedMultiProfiles = [];

    // Switch to files subtab
    switchFormatSubtab('files');

    // Show modal
    document.getElementById('format-task-modal').classList.remove('hidden');

    if (initialFiles && initialFiles.length > 0) {
      addFilesToFormatTask(initialFiles);
    } else {
      renderFormatFilesTable();
    }
  }

  function updatePresetDisplays() {
    const presetNameEl = document.getElementById('ft-preset-name');
    if (presetNameEl) presetNameEl.textContent = currentPresetName;

    const appendLbl = document.getElementById('ft-lbl-append-name');
    if (appendLbl) appendLbl.textContent = `Append setting name [${currentPresetName}]`;
  }

  function closeFormatTaskModal() {
    const modal = document.getElementById('format-task-modal');
    if (modal) modal.classList.add('hidden');

    // Stop previews
    const vid = document.getElementById('ft-preview-video');
    if (vid) { vid.pause(); vid.src = ''; }
    const aud = document.getElementById('ft-preview-audio');
    if (aud) { aud.pause(); aud.src = ''; }
    const img = document.getElementById('ft-preview-img');
    if (img) img.src = '';

    formatFiles = [];
    selectedFormatFileIndex = -1;
    selectedMultiProfiles = [];
    currentFormatTool = null;
  }

  async function promptAddFilesToFormatTask() {
    const def = TOOL_DEFS[currentFormatTool] || {};
    const filters = def.filters || [{ name: 'Media Files', extensions: ['*'] }];
    const files = await window.api.selectFiles(filters);
    if (files && files.length > 0) {
      addFilesToFormatTask(files);
    }
  }

  async function promptAddFolderToFormatTask() {
    const folder = await window.api.selectFolder();
    if (!folder) return;

    const def = TOOL_DEFS[currentFormatTool] || {};
    let exts = [];
    if (def.filters && def.filters[0] && def.filters[0].extensions) {
      exts = def.filters[0].extensions;
    }
    const scanned = await window.api.scanFolder(folder, exts);
    if (scanned && scanned.length > 0) {
      addFilesToFormatTask(scanned);
    } else {
      alert(currentLang === 'ar' ? 'لم يتم العثور على ملفات مطابقة داخل المجلد المحدد' : 'No matching files found in selected folder');
    }
  }

  async function promptAddMusicToVideo() {
    const files = await window.api.selectFiles([{ name: 'Audio Files', extensions: ['mp3', 'wav', 'aac', 'm4a', 'flac', 'ogg'] }]);
    if (files && files[0]) {
      currentFormatOptions.musicFile = files[0];
      const audioName = files[0].split(/[/\\]/).pop();
      alert(currentLang === 'ar' ? `تم تحديد المقطع الصوتي للخلفية:\n${audioName}` : `Background audio track selected:\n${audioName}`);
    }
  }

  async function addFilesToFormatTask(files) {
    if (!files || files.length === 0) return;

    for (const filePath of files) {
      if (formatFiles.some(f => f.path === filePath)) continue;

      const fileName = filePath.split(/[/\\]/).pop();
      const fileRecord = {
        path: filePath,
        name: fileName,
        size: '...',
        duration: '...',
        durationSec: 0,
        resolution: '...',
        metaLine: '',
        rawInfo: null,
        checked: true,
        divide: { mode: 'off', time: 60, count: 5, size: 1 },
        clip: { start: '', end: '', fadeIn: 'Off', fadeOut: 'Off', speed: 'Default' },
      };

      formatFiles.push(fileRecord);
      renderFormatFilesTable();

      // Probe metadata asynchronously via ffprobe
      window.api.getMediaInfo(filePath).then(info => {
        if (!info) return;
        fileRecord.rawInfo = info;

        // Size
        if (info.format?.size) {
          fileRecord.size = formatBytes(parseInt(info.format.size));
        }

        // Duration
        if (info.format?.duration) {
          fileRecord.durationSec = parseFloat(info.format.duration);
          fileRecord.duration = formatDuration(fileRecord.durationSec);
        }

        // Streams (video / audio)
        const vStream = info.streams?.find(s => s.codec_type === 'video');
        const aStream = info.streams?.find(s => s.codec_type === 'audio');

        if (vStream) {
          fileRecord.resolution = `${vStream.width || '?'}x${vStream.height || '?'}`;
          const parts = [fileRecord.size, vStream.codec_name, fileRecord.resolution, fileRecord.duration].filter(Boolean);
          fileRecord.metaLine = parts.join(' , ');
        } else if (aStream) {
          const ch = aStream.channels === 1 ? '1ch' : '2ch';
          const br = aStream.bit_rate ? Math.round(aStream.bit_rate / 1000) + 'Kbps' : '';
          const hz = (aStream.sample_rate || '44100') + 'Hz';
          const parts = [fileRecord.size, hz, ch, br, fileRecord.duration].filter(Boolean);
          fileRecord.metaLine = parts.join(' , ');
        } else {
          fileRecord.metaLine = [fileRecord.size, fileRecord.resolution].filter(Boolean).join(' , ');
        }

        renderFormatFilesTable();

        if (selectedFormatFileIndex >= 0 && formatFiles[selectedFormatFileIndex] === fileRecord) {
          updateMediaInfoView(fileRecord);
        }
      }).catch(err => {
        console.warn('ffprobe error:', err);
      });
    }

    if (selectedFormatFileIndex === -1 && formatFiles.length > 0) {
      selectFormatFile(0);
    }
    renderFormatFilesTable();
  }

  function renderFormatFilesTable() {
    const emptyState = document.getElementById('ft-empty-state');
    const tableContainer = document.getElementById('ft-table-container');
    const tbody = document.getElementById('ft-files-tbody');

    if (!tbody) return;
    tbody.innerHTML = '';

    if (formatFiles.length === 0) {
      if (emptyState) emptyState.style.display = 'flex';
      if (tableContainer) tableContainer.classList.add('hidden');
      selectedFormatFileIndex = -1;
      updatePreviewView(null);
      updateMediaInfoView(null);
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (tableContainer) tableContainer.classList.remove('hidden');

    formatFiles.forEach((file, idx) => {
      const tr = document.createElement('tr');
      tr.dataset.idx = idx;
      if (idx === selectedFormatFileIndex) tr.classList.add('selected');

      const isVideo = currentMediaType === 'video';
      const isAudio = currentMediaType === 'audio';
      const isImg = currentMediaType === 'image';
      const mediaIcon = isVideo ? '🎬' : isAudio ? '🎵' : isImg ? '🖼️' : '📄';

      const metaSub = file.metaLine || (file.size !== '...' ? `${file.size} • ${file.path}` : file.path);
      const isDivided = file.divide && file.divide.mode && file.divide.mode !== 'off';
      const isClipped = file.clip && (file.clip.start || file.clip.end);

      tr.innerHTML = `
        <td style="text-align:center;"><input type="checkbox" class="ft-row-chk" data-idx="${idx}" ${file.checked ? 'checked' : ''}></td>
        <td style="text-align:center;color:var(--text-muted);font-weight:700;">${idx + 1}</td>
        <td>
          <div class="ft-card-cell">
            <div class="ft-file-icon-box">${mediaIcon}</div>
            <div class="ft-file-details">
              <div class="ft-file-title" title="${file.path}">${file.name}</div>
              <div class="ft-file-meta-sub" title="${file.path}">${metaSub}</div>
            </div>
          </div>
        </td>
        <td style="text-align:center;">
          <div class="ft-row-actions">
            <button class="ft-btn-action ft-btn-divide ${isDivided ? 'active-badge' : ''}" data-idx="${idx}" title="تقسيم الملف (Divide)">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="5" r="2" fill="currentColor"/><line x1="5" y1="12" x2="19" y2="12"/><circle cx="12" cy="19" r="2" fill="currentColor"/></svg>
              <span>Divide${isDivided ? ' *' : ''}</span>
            </button>
            <button class="ft-btn-action ft-btn-option ${isClipped ? 'active-badge' : ''}" data-idx="${idx}" title="قص وتعديل المقطع (Option / Clip)">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>
              <span>Option${isClipped ? ' *' : ''}</span>
            </button>
          </div>
        </td>
        <td style="text-align:center;"><button class="ft-row-del" data-idx="${idx}" title="حذف من القائمة">×</button></td>
      `;

      tbody.appendChild(tr);
    });
  }

  function deleteFormatFile(idx) {
    if (idx < 0 || idx >= formatFiles.length) return;
    formatFiles.splice(idx, 1);
    if (selectedFormatFileIndex >= formatFiles.length) {
      selectedFormatFileIndex = formatFiles.length - 1;
    }
    renderFormatFilesTable();
    if (selectedFormatFileIndex >= 0) {
      selectFormatFile(selectedFormatFileIndex);
    } else {
      updatePreviewView(null);
      updateMediaInfoView(null);
    }
  }

  function selectFormatFile(idx) {
    if (idx < 0 || idx >= formatFiles.length) return;
    selectedFormatFileIndex = idx;

    // Highlight row
    document.querySelectorAll('#ft-files-tbody tr').forEach((tr, i) => {
      tr.classList.toggle('selected', i === idx);
    });

    const file = formatFiles[idx];
    updatePreviewView(file);
    updateMediaInfoView(file);
  }

  function moveSelectedFormatFile(direction) {
    if (selectedFormatFileIndex < 0 || formatFiles.length <= 1) return;
    const targetIdx = selectedFormatFileIndex + direction;
    if (targetIdx < 0 || targetIdx >= formatFiles.length) return;

    const temp = formatFiles[selectedFormatFileIndex];
    formatFiles[selectedFormatFileIndex] = formatFiles[targetIdx];
    formatFiles[targetIdx] = temp;

    selectedFormatFileIndex = targetIdx;
    renderFormatFilesTable();
  }

  function removeSelectedFormatFile() {
    deleteFormatFile(selectedFormatFileIndex);
  }

  // ========================================================
  // DIVIDE MODAL LOGIC
  // ========================================================
  let currentDivideIdx = -1;

  function initDivideModal() {
    document.getElementById('div-btn-close')?.addEventListener('click', closeDivideModal);
    document.getElementById('div-btn-cancel')?.addEventListener('click', closeDivideModal);
    document.getElementById('div-btn-ok')?.addEventListener('click', applyDivideSettings);
  }

  function openDivideModal(idx) {
    if (idx < 0 || idx >= formatFiles.length) return;
    currentDivideIdx = idx;
    const file = formatFiles[idx];
    const d = file.divide || { mode: 'off', time: 60, count: 5, size: 1 };

    const radioOff = document.getElementById('div-radio-off');
    const radioTime = document.getElementById('div-radio-time');
    const radioCount = document.getElementById('div-radio-count');
    const radioSize = document.getElementById('div-radio-size');

    if (d.mode === 'time') {
      if (radioTime) radioTime.checked = true;
    } else if (d.mode === 'count') {
      if (radioCount) radioCount.checked = true;
    } else if (d.mode === 'size') {
      if (radioSize) radioSize.checked = true;
    } else {
      if (radioOff) radioOff.checked = true;
    }

    const inTime = document.getElementById('div-input-time');
    if (inTime) inTime.value = d.time || 60;
    const inCount = document.getElementById('div-input-count');
    if (inCount) inCount.value = d.count || 5;
    const inSize = document.getElementById('div-input-size');
    if (inSize) inSize.value = d.size || 1;

    document.getElementById('divide-modal')?.classList.remove('hidden');
  }

  function closeDivideModal() {
    document.getElementById('divide-modal')?.classList.add('hidden');
    currentDivideIdx = -1;
  }

  function applyDivideSettings() {
    if (currentDivideIdx < 0 || currentDivideIdx >= formatFiles.length) {
      closeDivideModal();
      return;
    }

    const mode = document.querySelector('input[name="divide-mode"]:checked')?.value || 'off';
    const time = parseInt(document.getElementById('div-input-time')?.value, 10) || 60;
    const count = parseInt(document.getElementById('div-input-count')?.value, 10) || 5;
    const size = parseInt(document.getElementById('div-input-size')?.value, 10) || 1;

    formatFiles[currentDivideIdx].divide = { mode, time, count, size };
    closeDivideModal();
    renderFormatFilesTable();
  }

  // ========================================================
  // CLIP / OPTION MODAL LOGIC
  // ========================================================
  let currentClipIdx = -1;
  let clipPrecision = 0.1;

  function timeToSeconds(str) {
    if (!str || typeof str !== 'string') return 0;
    const parts = str.trim().split(':');
    if (parts.length === 3) {
      const h = parseFloat(parts[0]) || 0;
      const m = parseFloat(parts[1]) || 0;
      const s = parseFloat(parts[2]) || 0;
      return h * 3600 + m * 60 + s;
    }
    return parseFloat(str) || 0;
  }

  function secondsToTimecode(sec) {
    if (isNaN(sec) || sec < 0) sec = 0;
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 1000);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  }

  function secondsToDisplay(sec) {
    if (isNaN(sec) || sec < 0) sec = 0;
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  function initClipModal() {
    document.getElementById('clip-btn-close')?.addEventListener('click', closeClipModal);
    document.getElementById('clip-btn-cancel')?.addEventListener('click', closeClipModal);
    document.getElementById('clip-btn-ok')?.addEventListener('click', applyClipSettings);

    const vid = document.getElementById('clip-video-player');
    const aud = document.getElementById('clip-audio-player');
    const playBtn = document.getElementById('clip-btn-play');
    const stopBtn = document.getElementById('clip-btn-stop');
    const prevBtn = document.getElementById('clip-btn-prev-frame');
    const nextBtn = document.getElementById('clip-btn-next-frame');
    const track = document.getElementById('clip-timeline-track');

    function getActivePlayer() {
      return (currentMediaType === 'video' ? vid : aud);
    }

    playBtn?.addEventListener('click', () => {
      const p = getActivePlayer();
      if (!p) return;
      if (p.paused) {
        p.play();
        playBtn.textContent = '⏸';
      } else {
        p.pause();
        playBtn.textContent = '▶';
      }
    });

    stopBtn?.addEventListener('click', () => {
      const p = getActivePlayer();
      if (!p) return;
      p.pause();
      p.currentTime = 0;
      if (playBtn) playBtn.textContent = '▶';
    });

    prevBtn?.addEventListener('click', () => {
      const p = getActivePlayer();
      if (!p) return;
      p.currentTime = Math.max(0, p.currentTime - clipPrecision);
    });

    nextBtn?.addEventListener('click', () => {
      const p = getActivePlayer();
      if (!p) return;
      const maxT = p.duration || 999999;
      p.currentTime = Math.min(maxT, p.currentTime + clipPrecision);
    });

    function onTimeUpdate(p) {
      const cur = p.currentTime || 0;
      const tot = p.duration || (formatFiles[currentClipIdx]?.durationSec || 0);
      const curEl = document.getElementById('clip-time-current');
      const totEl = document.getElementById('clip-time-total');
      const playhead = document.getElementById('clip-timeline-playhead');
      if (curEl) curEl.textContent = secondsToDisplay(cur);
      if (totEl && tot > 0) totEl.textContent = secondsToDisplay(tot);
      if (playhead && tot > 0) {
        const pct = Math.min(100, Math.max(0, (cur / tot) * 100));
        playhead.style.left = `${pct}%`;
      }
    }

    vid?.addEventListener('timeupdate', () => onTimeUpdate(vid));
    aud?.addEventListener('timeupdate', () => onTimeUpdate(aud));

    track?.addEventListener('click', (e) => {
      const rect = track.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      const p = getActivePlayer();
      if (p && p.duration) {
        p.currentTime = Math.max(0, Math.min(p.duration, pos * p.duration));
      }
    });

    // Mark start and end buttons
    document.getElementById('clip-btn-set-start')?.addEventListener('click', () => {
      const p = getActivePlayer();
      const t = p ? p.currentTime : 0;
      const inp = document.getElementById('clip-input-start');
      if (inp) inp.value = secondsToTimecode(t);
      updateClipTimelineRange();
    });

    document.getElementById('clip-btn-set-end')?.addEventListener('click', () => {
      const p = getActivePlayer();
      const t = p && p.duration ? (p.currentTime > 0 ? p.currentTime : p.duration) : 0;
      const inp = document.getElementById('clip-input-end');
      if (inp) inp.value = secondsToTimecode(t);
      updateClipTimelineRange();
    });

    // Steppers +/-
    document.getElementById('clip-step-minus-start')?.addEventListener('click', () => {
      stepClipInput('clip-input-start', -clipPrecision);
    });
    document.getElementById('clip-step-plus-start')?.addEventListener('click', () => {
      stepClipInput('clip-input-start', clipPrecision);
    });
    document.getElementById('clip-step-minus-end')?.addEventListener('click', () => {
      stepClipInput('clip-input-end', -clipPrecision);
    });
    document.getElementById('clip-step-plus-end')?.addEventListener('click', () => {
      stepClipInput('clip-input-end', clipPrecision);
    });

    // Precision change
    document.getElementById('clip-opt-precision')?.addEventListener('change', (e) => {
      clipPrecision = parseFloat(e.target.value) || 0.1;
    });

    // Input changes
    document.getElementById('clip-input-start')?.addEventListener('change', updateClipTimelineRange);
    document.getElementById('clip-input-end')?.addEventListener('change', updateClipTimelineRange);
  }

  function stepClipInput(id, delta) {
    const inp = document.getElementById(id);
    if (!inp) return;
    let s = timeToSeconds(inp.value) + delta;
    if (s < 0) s = 0;
    inp.value = secondsToTimecode(s);
    updateClipTimelineRange();
  }

  function updateClipTimelineRange() {
    const sInp = document.getElementById('clip-input-start');
    const eInp = document.getElementById('clip-input-end');
    const rangeEl = document.getElementById('clip-timeline-range');
    const durEl = document.getElementById('clip-duration-val');
    if (!sInp || !eInp) return;

    const startSec = timeToSeconds(sInp.value);
    const endSec = timeToSeconds(eInp.value);

    const p = currentMediaType === 'video' ? document.getElementById('clip-video-player') : document.getElementById('clip-audio-player');
    const totalSec = p && p.duration ? p.duration : (formatFiles[currentClipIdx]?.durationSec || Math.max(endSec, 1));

    if (totalSec > 0 && rangeEl) {
      const leftPct = Math.min(100, (startSec / totalSec) * 100);
      const rightPct = Math.max(leftPct, Math.min(100, (endSec > 0 ? (endSec / totalSec) * 100 : 100)));
      rangeEl.style.left = `${leftPct}%`;
      rangeEl.style.width = `${rightPct - leftPct}%`;
    }

    if (durEl) {
      const diff = endSec > startSec ? endSec - startSec : 0;
      durEl.textContent = secondsToTimecode(diff);
    }
  }

  function openClipModal(idx) {
    if (idx < 0 || idx >= formatFiles.length) return;
    currentClipIdx = idx;
    const file = formatFiles[idx];

    const modal = document.getElementById('clip-modal');
    const title = document.getElementById('clip-window-title');
    if (title) title.textContent = `Clip / Option — ${file.name}`;

    const vid = document.getElementById('clip-video-player');
    const aud = document.getElementById('clip-audio-player');
    const vis = document.getElementById('clip-audio-visualizer');
    const safeUrl = 'file:///' + file.path.replace(/\\/g, '/');

    if (currentMediaType === 'video') {
      if (vid) {
        vid.src = safeUrl;
        vid.style.display = 'block';
        vid.currentTime = 0;
      }
      if (vis) vis.style.display = 'none';
      if (aud) { aud.src = ''; aud.style.display = 'none'; }
    } else {
      if (vid) { vid.src = ''; vid.style.display = 'none'; }
      if (vis) vis.style.display = 'flex';
      if (aud) {
        aud.src = safeUrl;
        aud.currentTime = 0;
      }
    }

    const c = file.clip || {};
    const sInp = document.getElementById('clip-input-start');
    const eInp = document.getElementById('clip-input-end');
    if (sInp) sInp.value = c.start || '00:00:00.000';
    if (eInp) eInp.value = c.end || (file.durationSec ? secondsToTimecode(file.durationSec) : '00:00:00.000');

    setSelectVal('clip-opt-fadein', c.fadeIn || 'Off');
    setSelectVal('clip-opt-fadeout', c.fadeOut || 'Off');
    setSelectVal('clip-opt-speed', c.speed || 'Default');

    modal?.classList.remove('hidden');

    setTimeout(() => {
      updateClipTimelineRange();
    }, 200);
  }

  function closeClipModal() {
    const vid = document.getElementById('clip-video-player');
    const aud = document.getElementById('clip-audio-player');
    if (vid) { vid.pause(); vid.src = ''; }
    if (aud) { aud.pause(); aud.src = ''; }
    const playBtn = document.getElementById('clip-btn-play');
    if (playBtn) playBtn.textContent = '▶';
    document.getElementById('clip-modal')?.classList.add('hidden');
    currentClipIdx = -1;
  }

  function applyClipSettings() {
    if (currentClipIdx < 0 || currentClipIdx >= formatFiles.length) {
      closeClipModal();
      return;
    }

    const sInp = document.getElementById('clip-input-start');
    const eInp = document.getElementById('clip-input-end');
    const fadeIn = getSelectVal('clip-opt-fadein');
    const fadeOut = getSelectVal('clip-opt-fadeout');
    const speed = getSelectVal('clip-opt-speed');

    const startVal = sInp ? sInp.value.trim() : '';
    const endVal = eInp ? eInp.value.trim() : '';

    formatFiles[currentClipIdx].clip = {
      start: startVal !== '00:00:00.000' && startVal !== '00:00:00' ? startVal : '',
      end: endVal !== '00:00:00.000' && endVal !== '00:00:00' ? endVal : '',
      fadeIn,
      fadeOut,
      speed,
    };

    closeClipModal();
    renderFormatFilesTable();
  }

  // ========================================================
  // CONTEXT MENUS LOGIC
  // ========================================================
  let contextFormatFileIndex = -1;
  let contextTaskId = null;

  function initContextMenus() {
    const fileCtx = document.getElementById('format-file-context-menu');
    const queueCtx = document.getElementById('queue-task-context-menu');

    // Right-click on format modal file table
    const ftTable = document.getElementById('ft-files-tbody');
    ftTable?.addEventListener('contextmenu', (e) => {
      const tr = e.target.closest('tr');
      if (!tr || tr.dataset.idx === undefined) return;
      e.preventDefault();
      const idx = parseInt(tr.dataset.idx, 10);
      contextFormatFileIndex = idx;
      selectFormatFile(idx);

      if (fileCtx) {
        fileCtx.style.left = `${Math.min(e.clientX, window.innerWidth - 240)}px`;
        fileCtx.style.top = `${Math.min(e.clientY, window.innerHeight - 200)}px`;
        fileCtx.classList.remove('hidden');
      }
      if (queueCtx) queueCtx.classList.add('hidden');
    });

    // Right-click on main queue table
    const taskTbody = document.getElementById('task-tbody');
    taskTbody?.addEventListener('contextmenu', (e) => {
      const tr = e.target.closest('tr');
      if (!tr) return;
      e.preventDefault();
      contextTaskId = tr.dataset.id;

      if (queueCtx) {
        queueCtx.style.left = `${Math.min(e.clientX, window.innerWidth - 240)}px`;
        queueCtx.style.top = `${Math.min(e.clientY, window.innerHeight - 240)}px`;
        queueCtx.classList.remove('hidden');
      }
      if (fileCtx) fileCtx.classList.add('hidden');
    });

    // Actions for format file context menu
    fileCtx?.addEventListener('click', (e) => {
      const item = e.target.closest('.ctx-item');
      if (!item) return;
      const act = item.dataset.action;
      fileCtx.classList.add('hidden');

      if (contextFormatFileIndex < 0 || contextFormatFileIndex >= formatFiles.length) return;
      if (act === 'clip') {
        openClipModal(contextFormatFileIndex);
      } else if (act === 'divide') {
        openDivideModal(contextFormatFileIndex);
      } else if (act === 'preview') {
        switchFormatSubtab('preview');
      } else if (act === 'delete') {
        deleteFormatFile(contextFormatFileIndex);
      }
    });

    // Actions for queue task context menu
    queueCtx?.addEventListener('click', async (e) => {
      const item = e.target.closest('.ctx-item');
      if (!item) return;
      const act = item.dataset.action;
      queueCtx.classList.add('hidden');

      if (act === 'start') {
        startAllTasks();
      } else if (act === 'stop') {
        stopAllTasks();
      } else if (act === 'open-folder') {
        if (contextTaskId) {
          const t = tasks.find(x => x.id === contextTaskId);
          if (t && t.outputPath) {
            window.api.showItemInFolder(t.outputPath);
          } else {
            window.api.openFolder();
          }
        } else {
          window.api.openFolder();
        }
      } else if (act === 'remove') {
        if (contextTaskId) {
          tasks = tasks.filter(x => x.id !== contextTaskId);
          renderTasks();
        }
      } else if (act === 'clear-all') {
        clearAllTasks();
      }
    });

    // Dismiss context menus on click or escape
    window.addEventListener('click', (e) => {
      if (!e.target.closest('.custom-context-menu')) {
        fileCtx?.classList.add('hidden');
        queueCtx?.classList.add('hidden');
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        fileCtx?.classList.add('hidden');
        queueCtx?.classList.add('hidden');
      }
    });
  }


  function switchFormatSubtab(subtabName) {
    formatSubtab = subtabName;
    document.querySelectorAll('.format-subtab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.subtab === subtabName);
    });

    document.querySelectorAll('.format-view-section').forEach(view => {
      view.classList.toggle('active', view.id === `ft-view-${subtabName}`);
      view.classList.toggle('hidden', view.id !== `ft-view-${subtabName}`);
    });

    if (subtabName === 'preview' && selectedFormatFileIndex >= 0) {
      updatePreviewView(formatFiles[selectedFormatFileIndex]);
    } else if (subtabName === 'mediainfo' && selectedFormatFileIndex >= 0) {
      updateMediaInfoView(formatFiles[selectedFormatFileIndex]);
    }
  }

  function updatePreviewView(file) {
    const vid = document.getElementById('ft-preview-video');
    const aud = document.getElementById('ft-preview-audio');
    const img = document.getElementById('ft-preview-img');
    const placeholder = document.getElementById('ft-preview-placeholder');

    if (!file) {
      if (placeholder) placeholder.style.display = 'block';
      if (vid) vid.style.display = 'none';
      if (aud) aud.style.display = 'none';
      if (img) img.style.display = 'none';
      return;
    }

    if (placeholder) placeholder.style.display = 'none';

    const safeUrl = 'file:///' + file.path.replace(/\\/g, '/');

    if (currentMediaType === 'video') {
      if (vid) {
        vid.src = safeUrl;
        vid.style.display = 'block';
      }
      if (aud) aud.style.display = 'none';
      if (img) img.style.display = 'none';
    } else if (currentMediaType === 'audio') {
      if (aud) {
        aud.src = safeUrl;
        aud.style.display = 'block';
      }
      if (vid) vid.style.display = 'none';
      if (img) img.style.display = 'none';
    } else {
      if (img) {
        img.src = safeUrl;
        img.style.display = 'block';
      }
      if (vid) vid.style.display = 'none';
      if (aud) aud.style.display = 'none';
    }
  }

  function updateMediaInfoView(file) {
    const container = document.getElementById('ft-mediainfo-content');
    if (!container) return;

    if (!file || !file.rawInfo) {
      container.innerHTML = `<div style="padding:24px;text-align:center;color:var(--text-muted);">${file ? file.path : 'اختر ملفاً لعرض معلومات الوسائط'}</div>`;
      return;
    }

    const fmt = file.rawInfo.format || {};
    const streams = file.rawInfo.streams || [];
    const vStream = streams.find(s => s.codec_type === 'video');
    const aStream = streams.find(s => s.codec_type === 'audio');

    let html = `
      <div style="display:flex;flex-direction:column;gap:14px;padding:8px;">
        <div style="background:var(--bg-tertiary);padding:12px;border-radius:6px;border:1px solid var(--border-subtle);">
          <h4 style="color:var(--accent-glow);margin-bottom:8px;font-size:13px;">📁 General Information</h4>
          <div><strong>File Name:</strong> ${file.name}</div>
          <div><strong>File Size:</strong> ${file.size} (${fmt.size || 0} bytes)</div>
          <div><strong>Duration:</strong> ${file.duration} (${parseFloat(fmt.duration || 0).toFixed(2)}s)</div>
          <div><strong>Container Format:</strong> ${fmt.format_long_name || fmt.format_name || 'N/A'}</div>
          <div><strong>Overall Bitrate:</strong> ${fmt.bit_rate ? Math.round(fmt.bit_rate / 1000) + ' kbps' : 'N/A'}</div>
          <div style="font-size:11px;opacity:0.8;margin-top:4px;word-break:break-all;"><strong>Source Path:</strong> ${file.path}</div>
        </div>
    `;

    if (vStream) {
      html += `
        <div style="background:var(--bg-tertiary);padding:12px;border-radius:6px;border:1px solid var(--border-subtle);">
          <h4 style="color:#38bdf8;margin-bottom:8px;font-size:13px;">🎬 Video Stream (#0:${vStream.index})</h4>
          <div><strong>Codec:</strong> ${vStream.codec_long_name || vStream.codec_name} (${vStream.codec_name})</div>
          <div><strong>Resolution:</strong> ${vStream.width} x ${vStream.height}</div>
          <div><strong>Display Aspect Ratio:</strong> ${vStream.display_aspect_ratio || 'Automatic'}</div>
          <div><strong>Frame Rate:</strong> ${vStream.r_frame_rate ? evalSafe(vStream.r_frame_rate) + ' fps' : 'Default'}</div>
          <div><strong>Pixel Format:</strong> ${vStream.pix_fmt || 'N/A'}</div>
          ${vStream.bit_rate ? `<div><strong>Bitrate:</strong> ${Math.round(vStream.bit_rate / 1000)} kbps</div>` : ''}
        </div>
      `;
    }

    if (aStream) {
      html += `
        <div style="background:var(--bg-tertiary);padding:12px;border-radius:6px;border:1px solid var(--border-subtle);">
          <h4 style="color:#10b981;margin-bottom:8px;font-size:13px;">🎵 Audio Stream (#0:${aStream.index})</h4>
          <div><strong>Codec:</strong> ${aStream.codec_long_name || aStream.codec_name} (${aStream.codec_name})</div>
          <div><strong>Sample Rate:</strong> ${aStream.sample_rate} Hz</div>
          <div><strong>Channels:</strong> ${aStream.channels} (${aStream.channel_layout || 'Stereo'})</div>
          ${aStream.bit_rate ? `<div><strong>Bitrate:</strong> ${Math.round(aStream.bit_rate / 1000)} kbps</div>` : ''}
        </div>
      `;
    }

    html += `</div>`;
    container.innerHTML = html;
  }

  function evalSafe(fraction) {
    if (!fraction || typeof fraction !== 'string') return fraction;
    const parts = fraction.split('/');
    if (parts.length === 2 && parseFloat(parts[1]) > 0) {
      return (parseFloat(parts[0]) / parseFloat(parts[1])).toFixed(2);
    }
    return fraction;
  }

  function openSettingModal() {
    if (currentFormatTool === 'disc_iso_cso') {
      openCsoCompressModal();
      return;
    }
    if (currentMediaType === 'video') {
      populateVideoSettingsModal();
      document.getElementById('video-setting-modal').classList.remove('hidden');
    } else if (currentMediaType === 'audio') {
      populateAudioSettingsModal();
      document.getElementById('audio-setting-modal').classList.remove('hidden');
    } else if (currentMediaType === 'image') {
      populatePictureSettingsModal();
      document.getElementById('picture-setting-modal').classList.remove('hidden');
    }
  }

  function populateVideoSettingsModal() {
    const sel = document.getElementById('vs-preset-select');
    if (sel) sel.value = currentPresetKey || 'optimum';

    const opts = currentFormatOptions || {};

    // 1. Video Tab
    setSelectVal('vs-opt-size-limit', opts.sizeLimit || 'Off');
    setSelectVal('vs-opt-video-encode', opts.videoEncode || 'AVC(H264)');
    setSelectVal('vs-opt-video-size', opts.videoSize || '<1080p');
    setSelectVal('vs-opt-bitrate', opts.bitrate || 'Default');
    setSelectVal('vs-opt-crf', opts.crf || 'Off');
    setSelectVal('vs-opt-gpu', opts.gpu || 'Auto');
    setSelectVal('vs-opt-fps', opts.fps || 'Default');
    setSelectVal('vs-opt-aspect-ratio', opts.aspectRatio || 'Automatic');
    setSelectVal('vs-opt-2pass', opts.encode2Pass || 'No');
    setSelectVal('vs-opt-keyframe', opts.keyframe || 'Default');
    setSelectVal('vs-opt-deinterlace', opts.deinterlace || 'No');
    setSelectVal('vs-opt-rotate', opts.rotate || 'No');
    setSelectVal('vs-opt-xmirror', opts.xMirror || 'No');
    setSelectVal('vs-opt-ymirror', opts.yMirror || 'No');
    setSelectVal('vs-opt-filter', opts.filter || 'Off');
    setSelectVal('vs-opt-fadein', opts.fadeIn || 'Off');
    setSelectVal('vs-opt-fadeout', opts.fadeOut || 'Off');
    setSelectVal('vs-opt-antishake', opts.antiShake || 'Off');
    setSelectVal('vs-opt-denoise', opts.denoise || 'No');
    setSelectVal('vs-opt-reverse', opts.reverse || 'No');

    // 2. Audio tab inside video
    setSelectVal('vs-opt-audio-encode', opts.audioEncode || 'AAC');
    setSelectVal('vs-opt-audio-samplerate', opts.audioSampleRate || '44100');
    setSelectVal('vs-opt-audio-bitrate', opts.audioBitrate || '128K');
    setSelectVal('vs-opt-audio-channel', opts.audioChannel || '2');
    setSelectVal('vs-opt-audio-disable', opts.audioDisable || 'No');
    setSelectVal('vs-opt-audio-volume', opts.audioVolume || '100%');
    setSelectVal('vs-opt-audio-keep-streams', opts.audioKeepStreams || 'No');
    setSelectVal('vs-opt-audio-fadein', opts.audioFadeIn || 'Off');
    setSelectVal('vs-opt-audio-fadeout', opts.audioFadeOut || 'Off');
    setSelectVal('vs-opt-audio-echo', opts.audioEcho || 'No');
    setSelectVal('vs-opt-audio-denoise', opts.audioDenoise || 'No');
    setSelectVal('vs-opt-audio-reverse', opts.audioReverse || 'No');

    // 3. Subtitle tab
    setSelectVal('vs-opt-sub-keep-streams', opts.subKeepStreams || 'No');
    setInputVal('vs-opt-subtitle-path', opts.subtitlePath || '');
    setSelectVal('vs-opt-sub-type', opts.subType || 'Automatic');
    setSelectVal('vs-opt-sub-fontsize', opts.subFontSize || 'Default');
    setSelectVal('vs-opt-sub-codepage', opts.subCodePage || '1252');
    setSelectVal('vs-opt-sub-fontfamily', opts.subFontFamily || 'Tahoma');
    setInputVal('vs-opt-sub-fontcolor', opts.subFontColor || '#57c0ff');
    const fColorLbl = document.getElementById('vs-lbl-sub-fontcolor');
    if (fColorLbl) fColorLbl.textContent = hexToRgbLabel(opts.subFontColor || '#57c0ff');
    setSelectVal('vs-opt-sub-borderstyle', opts.subBorderStyle || 'Border+Shadow');
    setSelectVal('vs-opt-sub-outlinesize', opts.subOutlineSize || '1');
    setInputVal('vs-opt-sub-outlinecolor', opts.subOutlineColor || '#ffffff');
    const oColorLbl = document.getElementById('vs-lbl-sub-outlinecolor');
    if (oColorLbl) oColorLbl.textContent = hexToRgbLabel(opts.subOutlineColor || '#ffffff');
    setSelectVal('vs-opt-sub-shadowsize', opts.subShadowSize || '1');
    setSelectVal('vs-opt-sub-fontscheme', opts.subFontScheme || 'Scheme1');

    // 4. Other tab
    setInputVal('vs-opt-meta-title', opts.metaTitle || '');
    setInputVal('vs-opt-meta-author', opts.metaAuthor || '');
    setInputVal('vs-opt-meta-comment', opts.metaComment || '');
    setSelectVal('vs-opt-faststart', opts.fastStart || 'Yes');
    setSelectVal('vs-opt-2pass-other', opts.encode2Pass || 'No');

    // 5. Watermark tab
    setSelectVal('vs-opt-wm-enable', opts.watermarkEnabled || (opts.watermarkPath ? 'Yes' : 'No'));
    setSelectVal('vs-opt-wm-type', opts.watermarkType || 'Image');
    setInputVal('vs-opt-watermark-path', opts.watermarkPath || '');
    setInputVal('vs-opt-wm-text', opts.watermarkText || '');
    setSelectVal('vs-opt-wm-pos', opts.watermarkPos || 'bottom-right');
    setSelectVal('vs-opt-wm-opacity', opts.watermarkOpacity || '80');
    setSelectVal('vs-opt-wm-margin', opts.watermarkMargin || '20');
    setSelectVal('vs-opt-wm-scale', opts.watermarkScale || '15');

    const isText = (opts.watermarkType === 'Text');
    const rowImg = document.getElementById('vs-row-wm-image');
    const rowTxt = document.getElementById('vs-row-wm-text');
    if (rowImg) rowImg.style.display = isText ? 'none' : '';
    if (rowTxt) rowTxt.style.display = isText ? '' : 'none';
  }

  function populateAudioSettingsModal() {
    const sel = document.getElementById('as-preset-select');
    if (sel) sel.value = currentPresetKey || 'high';

    const opts = currentFormatOptions || {};
    setSelectVal('as-opt-audio-encode', opts.audioEncode || 'MP3');
    setSelectVal('as-opt-sample-rate', opts.sampleRate || '48000');
    setSelectVal('as-opt-bitrate', opts.bitrate || '320');
    setSelectVal('as-opt-channel', opts.channel || '2');
    setSelectVal('as-opt-volume', opts.volume || '100');
    setSelectVal('as-opt-vbr', opts.vbr || 'Off');
    setSelectVal('as-opt-sample-format', opts.sampleFormat || 'Default');
    setSelectVal('as-opt-fadein', opts.fadeIn || 'No');
    setSelectVal('as-opt-fadeout', opts.fadeOut || 'No');
    setSelectVal('as-opt-echo', opts.echo || 'No');
    setSelectVal('as-opt-denoise', opts.denoise || 'No');
    setSelectVal('as-opt-reverse', opts.reverse || 'No');
  }

  function populatePictureSettingsModal() {
    const sel = document.getElementById('ps-preset-select');
    if (sel) sel.value = currentPresetKey || 'original';

    const opts = currentFormatOptions || {};
    setSelectVal('ps-opt-quality', opts.quality || '90');
    const w = document.getElementById('ps-input-max-width');
    if (w) w.value = opts.maxWidth || 0;
    const h = document.getElementById('ps-input-max-height');
    if (h) h.value = opts.maxHeight || 0;
    const chk = document.getElementById('ps-chk-size-limit');
    if (chk) chk.checked = opts.sizeLimit !== false;
    setSelectVal('ps-opt-rotate', opts.rotate || 'No');
    setSelectVal('ps-opt-flip', opts.flip || 'No');
  }

  function setSelectVal(id, val) {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = val;
  }

  function getSelectVal(id) {
    const el = document.getElementById(id);
    return el ? el.value : '';
  }

  function setInputVal(id, val) {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = val !== undefined && val !== null ? val : '';
  }

  function getInputVal(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function hexToRgbLabel(hex) {
    if (!hex) return '[0, 0, 0] (0)';
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const num = parseInt(c, 16);
    if (isNaN(num)) return '[0, 0, 0] (0)';
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `[${r}, ${g}, ${b}] (0)`;
  }

  function onVideoPresetChange(key) {
    if (key === 'custom') {
      currentPresetKey = 'custom';
      currentPresetName = 'Custom';
      return;
    }
    const p = VIDEO_PRESETS[key];
    if (!p) return;
    currentPresetKey = key;
    currentPresetName = p.name;

    if (p.videoEncode) setSelectVal('vs-opt-video-encode', p.videoEncode);
    if (p.videoSize) setSelectVal('vs-opt-video-size', p.videoSize);
    if (p.bitrate) setSelectVal('vs-opt-bitrate', p.bitrate);
    if (p.crf) setSelectVal('vs-opt-crf', p.crf);
    if (p.gpu) setSelectVal('vs-opt-gpu', p.gpu);
    if (p.fps) setSelectVal('vs-opt-fps', p.fps);
    if (p.aspectRatio) setSelectVal('vs-opt-aspect-ratio', p.aspectRatio);
    if (p.encode2Pass) setSelectVal('vs-opt-2pass', p.encode2Pass);
    if (p.keyframe) setSelectVal('vs-opt-keyframe', p.keyframe);
    if (p.deinterlace) setSelectVal('vs-opt-deinterlace', p.deinterlace);

    if (p.audioEncode) setSelectVal('vs-opt-audio-encode', p.audioEncode);
    if (p.audioBitrate) setSelectVal('vs-opt-audio-bitrate', p.audioBitrate);
    if (p.audioSampleRate) setSelectVal('vs-opt-audio-samplerate', p.audioSampleRate);
    if (p.audioChannel) setSelectVal('vs-opt-audio-channel', p.audioChannel);
    if (p.audioVolume) setSelectVal('vs-opt-audio-volume', p.audioVolume);
  }

  function onAudioPresetChange(key) {
    if (key === 'custom') {
      currentPresetKey = 'custom';
      currentPresetName = 'Custom';
      return;
    }
    const p = AUDIO_PRESETS[key];
    if (!p) return;
    currentPresetKey = key;
    currentPresetName = p.name;

    if (p.audioEncode) setSelectVal('as-opt-audio-encode', p.audioEncode);
    if (p.sampleRate) setSelectVal('as-opt-sample-rate', p.sampleRate);
    if (p.bitrate) setSelectVal('as-opt-bitrate', p.bitrate);
    if (p.channel) setSelectVal('as-opt-channel', p.channel);
    if (p.volume) setSelectVal('as-opt-volume', p.volume);
    if (p.vbr) setSelectVal('as-opt-vbr', p.vbr);
    if (p.sampleFormat) setSelectVal('as-opt-sample-format', p.sampleFormat);
  }

  function onPicturePresetChange(key) {
    if (key === 'custom') {
      currentPresetKey = 'custom';
      currentPresetName = 'Custom';
      return;
    }
    const p = PICTURE_PRESETS[key];
    if (!p) return;
    currentPresetKey = key;
    currentPresetName = p.name;

    if (p.quality) setSelectVal('ps-opt-quality', p.quality);
    const w = document.getElementById('ps-input-max-width');
    if (w) w.value = p.limitWidth || 0;
    const h = document.getElementById('ps-input-max-height');
    if (h) h.value = p.limitHeight || 0;
    if (p.rotate) setSelectVal('ps-opt-rotate', p.rotate);
    if (p.flip) setSelectVal('ps-opt-flip', p.flip);
  }

  function applyVideoSettings() {
    const sel = document.getElementById('vs-preset-select');
    currentPresetKey = sel ? sel.value : currentPresetKey;
    if (currentPresetKey !== 'custom' && VIDEO_PRESETS[currentPresetKey]) {
      currentPresetName = VIDEO_PRESETS[currentPresetKey].name;
    }

    currentFormatOptions = {
      ...currentFormatOptions,
      // 1. Video
      sizeLimit: getSelectVal('vs-opt-size-limit'),
      videoEncode: getSelectVal('vs-opt-video-encode'),
      videoSize: getSelectVal('vs-opt-video-size'),
      bitrate: getSelectVal('vs-opt-bitrate'),
      crf: getSelectVal('vs-opt-crf'),
      gpu: getSelectVal('vs-opt-gpu'),
      fps: getSelectVal('vs-opt-fps'),
      aspectRatio: getSelectVal('vs-opt-aspect-ratio'),
      encode2Pass: getSelectVal('vs-opt-2pass'),
      keyframe: getSelectVal('vs-opt-keyframe'),
      deinterlace: getSelectVal('vs-opt-deinterlace'),
      rotate: getSelectVal('vs-opt-rotate'),
      xMirror: getSelectVal('vs-opt-xmirror'),
      yMirror: getSelectVal('vs-opt-ymirror'),
      filter: getSelectVal('vs-opt-filter'),
      fadeIn: getSelectVal('vs-opt-fadein'),
      fadeOut: getSelectVal('vs-opt-fadeout'),
      antiShake: getSelectVal('vs-opt-antishake'),
      denoise: getSelectVal('vs-opt-denoise'),
      reverse: getSelectVal('vs-opt-reverse'),

      // 2. Audio
      audioEncode: getSelectVal('vs-opt-audio-encode'),
      audioSampleRate: getSelectVal('vs-opt-audio-samplerate'),
      audioBitrate: getSelectVal('vs-opt-audio-bitrate'),
      audioChannel: getSelectVal('vs-opt-audio-channel'),
      audioDisable: getSelectVal('vs-opt-audio-disable'),
      audioVolume: getSelectVal('vs-opt-audio-volume'),
      audioKeepStreams: getSelectVal('vs-opt-audio-keep-streams'),
      audioFadeIn: getSelectVal('vs-opt-audio-fadein'),
      audioFadeOut: getSelectVal('vs-opt-audio-fadeout'),
      audioEcho: getSelectVal('vs-opt-audio-echo'),
      audioDenoise: getSelectVal('vs-opt-audio-denoise'),
      audioReverse: getSelectVal('vs-opt-audio-reverse'),

      // 3. Subtitles
      subKeepStreams: getSelectVal('vs-opt-sub-keep-streams'),
      subtitlePath: getInputVal('vs-opt-subtitle-path'),
      subType: getSelectVal('vs-opt-sub-type'),
      subFontSize: getSelectVal('vs-opt-sub-fontsize'),
      subCodePage: getSelectVal('vs-opt-sub-codepage'),
      subFontFamily: getSelectVal('vs-opt-sub-fontfamily'),
      subFontColor: getInputVal('vs-opt-sub-fontcolor'),
      subBorderStyle: getSelectVal('vs-opt-sub-borderstyle'),
      subOutlineSize: getSelectVal('vs-opt-sub-outlinesize'),
      subOutlineColor: getInputVal('vs-opt-sub-outlinecolor'),
      subShadowSize: getSelectVal('vs-opt-sub-shadowsize'),
      subFontScheme: getSelectVal('vs-opt-sub-fontscheme'),

      // 4. Other / Metadata
      metaTitle: getInputVal('vs-opt-meta-title'),
      metaAuthor: getInputVal('vs-opt-meta-author'),
      metaComment: getInputVal('vs-opt-meta-comment'),
      fastStart: getSelectVal('vs-opt-faststart'),

      // 5. Watermark
      watermarkEnabled: getSelectVal('vs-opt-wm-enable'),
      watermarkType: getSelectVal('vs-opt-wm-type'),
      watermarkPath: getInputVal('vs-opt-watermark-path'),
      watermarkText: getInputVal('vs-opt-wm-text'),
      watermarkPos: getSelectVal('vs-opt-wm-pos'),
      watermarkOpacity: getSelectVal('vs-opt-wm-opacity'),
      watermarkMargin: getSelectVal('vs-opt-wm-margin'),
      watermarkScale: getSelectVal('vs-opt-wm-scale'),
    };

    updatePresetDisplays();
    document.getElementById('video-setting-modal').classList.add('hidden');
  }

  function applyAudioSettings() {
    const sel = document.getElementById('as-preset-select');
    currentPresetKey = sel ? sel.value : currentPresetKey;
    if (currentPresetKey !== 'custom' && AUDIO_PRESETS[currentPresetKey]) {
      currentPresetName = AUDIO_PRESETS[currentPresetKey].name;
    }

    currentFormatOptions = {
      ...currentFormatOptions,
      audioEncode: getSelectVal('as-opt-audio-encode'),
      sampleRate: getSelectVal('as-opt-sample-rate'),
      bitrate: getSelectVal('as-opt-bitrate'),
      channel: getSelectVal('as-opt-channel'),
      volume: getSelectVal('as-opt-volume'),
      vbr: getSelectVal('as-opt-vbr'),
      sampleFormat: getSelectVal('as-opt-sample-format'),
      fadeIn: getSelectVal('as-opt-fadein'),
      fadeOut: getSelectVal('as-opt-fadeout'),
      echo: getSelectVal('as-opt-echo'),
      denoise: getSelectVal('as-opt-denoise'),
      reverse: getSelectVal('as-opt-reverse'),
    };

    updatePresetDisplays();
    document.getElementById('audio-setting-modal').classList.add('hidden');
  }

  function applyPictureSettings() {
    const sel = document.getElementById('ps-preset-select');
    currentPresetKey = sel ? sel.value : currentPresetKey;
    if (currentPresetKey !== 'custom' && PICTURE_PRESETS[currentPresetKey]) {
      currentPresetName = PICTURE_PRESETS[currentPresetKey].name;
    }

    const w = parseFloat(document.getElementById('ps-input-max-width')?.value) || 0;
    const h = parseFloat(document.getElementById('ps-input-max-height')?.value) || 0;
    const isLimit = document.getElementById('ps-chk-size-limit')?.checked !== false && (w > 0 || h > 0);

    currentFormatOptions = {
      ...currentFormatOptions,
      quality: parseInt(getSelectVal('ps-opt-quality')) || 90,
      sizeLimit: isLimit,
      maxWidth: w,
      maxHeight: h,
      rotate: getSelectVal('ps-opt-rotate'),
      flip: getSelectVal('ps-opt-flip'),
    };

    updatePresetDisplays();
    document.getElementById('picture-setting-modal').classList.add('hidden');
  }

  // ========================================================
  // MULTI-PROFILES MODAL LOGIC (Format Factory Multi-Profiles)
  // ========================================================
  let selectedMultiProfiles = [];

  function initMultiProfilesModal() {
    document.getElementById('mp-btn-close')?.addEventListener('click', closeMultiProfilesModal);
    document.getElementById('mp-btn-cancel')?.addEventListener('click', closeMultiProfilesModal);
    document.getElementById('mp-btn-minimize')?.addEventListener('click', closeMultiProfilesModal);
    document.getElementById('mp-btn-ok')?.addEventListener('click', applyMultiProfiles);

    // Select All Checkbox
    document.getElementById('mp-chk-select-all')?.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      document.querySelectorAll('.mp-item-chk').forEach(chk => {
        chk.checked = isChecked;
        chk.closest('.mp-profile-item')?.classList.toggle('selected', isChecked);
      });
    });

    // Delegated click on profile items list
    const listEl = document.getElementById('mp-profiles-list');
    listEl?.addEventListener('click', (e) => {
      const item = e.target.closest('.mp-profile-item');
      if (!item) return;

      const chk = item.querySelector('.mp-item-chk');
      if (e.target !== chk) {
        chk.checked = !chk.checked;
      }
      item.classList.toggle('selected', chk.checked);
      updateSelectAllState();
    });
  }

  function updateSelectAllState() {
    const chks = Array.from(document.querySelectorAll('.mp-item-chk'));
    const selectAll = document.getElementById('mp-chk-select-all');
    if (!selectAll || chks.length === 0) return;
    const allChecked = chks.every(c => c.checked);
    const someChecked = chks.some(c => c.checked);
    selectAll.checked = allChecked;
    selectAll.indeterminate = !allChecked && someChecked;
  }

  function openMultiProfilesModal() {
    const isAudio = currentMediaType === 'audio';
    const isVideo = currentMediaType === 'video';

    let profiles = [];
    if (isAudio) {
      profiles = [
        { id: 'high', name: 'High quality', type: 'cbr', color: '#3b82f6' },
        { id: 'medium', name: 'Medium quality', type: 'cbr', color: '#3b82f6' },
        { id: 'low', name: 'Low quality', type: 'cbr', color: '#3b82f6' },
        { id: 'vbr_high', name: 'VBR High quality', type: 'vbr', color: '#a855f7' },
        { id: 'vbr_medium', name: 'VBR Medium quality', type: 'vbr', color: '#a855f7' },
        { id: 'vbr_low', name: 'VBR Low quality', type: 'vbr', color: '#a855f7' },
      ];
    } else if (isVideo) {
      profiles = [
        { id: 'optimum', name: 'Optimum quality and size', type: 'video', color: '#0284c7' },
        { id: 'high', name: 'High quality and size', type: 'video', color: '#0284c7' },
        { id: 'medium', name: 'Medium quality and size', type: 'video', color: '#0284c7' },
        { id: 'low', name: 'Low quality and size', type: 'video', color: '#0284c7' },
        { id: 'avc_high', name: 'AVC High quality 1080p', type: 'video', color: '#10b981' },
        { id: 'hevc_high', name: 'HEVC High quality 1080p', type: 'video', color: '#8b5cf6' },
        { id: 'uhd_4k', name: '4K Ultra HD', type: 'video', color: '#f59e0b' },
        { id: 'qhd_2k', name: '2K Quad HD', type: 'video', color: '#06b6d4' },
      ];
    } else {
      profiles = [
        { id: 'original', name: 'Original quality', type: 'pic', color: '#0284c7' },
        { id: 'high', name: 'High quality', type: 'pic', color: '#3b82f6' },
        { id: 'medium', name: 'Medium quality', type: 'pic', color: '#3b82f6' },
        { id: 'low', name: 'Low quality', type: 'pic', color: '#3b82f6' },
      ];
    }

    renderMultiProfilesList(profiles);
    document.getElementById('multi-profiles-modal')?.classList.remove('hidden');
  }

  function closeMultiProfilesModal() {
    document.getElementById('multi-profiles-modal')?.classList.add('hidden');
  }

  function getProfileDocIconSvg(type, color) {
    if (type === 'vbr') {
      return `<svg class="mp-doc-icon" width="26" height="30" viewBox="0 0 24 28" fill="none">
        <path d="M3 2a2 2 0 0 1 2-2h10l6 6v20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V2z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2"/>
        <path d="M15 0v6h6" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1"/>
        <path d="M8 15a2 2 0 1 0 2-2V8l5-1.5v4.5a2 2 0 1 0 2-2V5L8 7v8z" fill="${color}"/>
        <text x="12" y="24" font-size="5" font-weight="700" text-anchor="middle" fill="${color}">Audio</text>
      </svg>`;
    } else if (type === 'video') {
      return `<svg class="mp-doc-icon" width="26" height="30" viewBox="0 0 24 28" fill="none">
        <path d="M3 2a2 2 0 0 1 2-2h10l6 6v20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V2z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2"/>
        <path d="M15 0v6h6" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1"/>
        <rect x="6.5" y="8" width="11" height="8" rx="1.5" fill="${color}"/>
        <polygon points="10,10.2 14.5,12 10,13.8" fill="#ffffff"/>
        <text x="12" y="24" font-size="5" font-weight="700" text-anchor="middle" fill="${color}">Video</text>
      </svg>`;
    } else {
      return `<svg class="mp-doc-icon" width="26" height="30" viewBox="0 0 24 28" fill="none">
        <path d="M3 2a2 2 0 0 1 2-2h10l6 6v20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V2z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2"/>
        <path d="M15 0v6h6" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1"/>
        <path d="M8 15a2 2 0 1 0 2-2V8l5-1.5v4.5a2 2 0 1 0 2-2V5L8 7v8z" fill="${color}"/>
        <text x="12" y="24" font-size="5" font-weight="700" text-anchor="middle" fill="${color}">Audio</text>
      </svg>`;
    }
  }

  function renderMultiProfilesList(profiles) {
    const listEl = document.getElementById('mp-profiles-list');
    if (!listEl) return;

    const activeKeys = (selectedMultiProfiles && selectedMultiProfiles.length > 0)
      ? selectedMultiProfiles
      : [currentPresetKey || profiles[0].id];

    listEl.innerHTML = profiles.map(p => {
      const isChecked = activeKeys.includes(p.id);
      return `
        <div class="mp-profile-item ${isChecked ? 'selected' : ''}" data-id="${p.id}">
          <input type="checkbox" class="mp-item-chk" ${isChecked ? 'checked' : ''} data-id="${p.id}">
          <div class="mp-item-icon">${getProfileDocIconSvg(p.type, p.color)}</div>
          <div class="mp-item-info">
            <span class="mp-item-name">${p.name}</span>
          </div>
        </div>
      `;
    }).join('');

    updateSelectAllState();
  }

  function applyMultiProfiles() {
    const checkedChks = Array.from(document.querySelectorAll('.mp-item-chk:checked'));
    if (checkedChks.length === 0) {
      alert('Please select at least one profile.');
      return;
    }

    const checkedIds = checkedChks.map(c => c.dataset.id);
    selectedMultiProfiles = checkedIds;

    if (checkedIds.length === 1) {
      const key = checkedIds[0];
      currentPresetKey = key;
      if (currentMediaType === 'audio') {
        currentPresetName = AUDIO_PRESETS[key]?.name || key;
        currentFormatOptions = { ...(AUDIO_PRESETS[key] || {}) };
        setSelectVal('as-preset-select', key);
      } else if (currentMediaType === 'video') {
        currentPresetName = VIDEO_PRESETS[key]?.name || key;
        currentFormatOptions = { ...(VIDEO_PRESETS[key] || {}) };
        setSelectVal('vs-preset-select', key);
      } else if (currentMediaType === 'picture') {
        currentPresetName = PICTURE_PRESETS[key]?.name || key;
        currentFormatOptions = { ...(PICTURE_PRESETS[key] || {}) };
        setSelectVal('ps-preset-select', key);
      }
      updatePresetDisplays();
    } else {
      const firstKey = checkedIds[0];
      currentPresetKey = firstKey;
      let firstName = firstKey;
      if (currentMediaType === 'audio') firstName = AUDIO_PRESETS[firstKey]?.name || firstKey;
      else if (currentMediaType === 'video') firstName = VIDEO_PRESETS[firstKey]?.name || firstKey;

      currentPresetName = `${firstName} (+${checkedIds.length - 1} Profiles)`;
      updatePresetDisplays();
    }

    closeMultiProfilesModal();
  }

  function confirmFormatTask() {
    const b = I18N[currentLang] || I18N.ar;
    const checkedFiles = formatFiles.filter(f => f.checked);

    if (checkedFiles.length === 0) {
      alert(b.alert_no_files || 'الرجاء إضافة ملف واحد على الأقل وتحديده للمتابعة');
      return;
    }

    const appendSettingName = document.getElementById('ft-chk-append-name')?.checked || false;
    const outputDir = document.getElementById('ft-output-dir-input')?.value || settings.outputDir || 'D:\\FLoutput';
    const def = TOOL_DEFS[currentFormatTool] || { name: 'Format', ext: '.mp4' };

    checkedFiles.forEach(file => {
      const profilesToCreate = (selectedMultiProfiles && selectedMultiProfiles.length > 1)
        ? selectedMultiProfiles
        : [currentPresetKey];

      profilesToCreate.forEach(pKey => {
        let presetOpts = {};
        let pName = currentPresetName;

        if (currentMediaType === 'audio') {
          presetOpts = AUDIO_PRESETS[pKey] || {};
          pName = presetOpts.name || pKey;
        } else if (currentMediaType === 'video') {
          presetOpts = VIDEO_PRESETS[pKey] || {};
          pName = presetOpts.name || pKey;
        } else if (currentMediaType === 'picture') {
          presetOpts = PICTURE_PRESETS[pKey] || {};
          pName = presetOpts.name || pKey;
        } else if (currentFormatTool === 'disc_iso_cso') {
          pName = `CSO Level ${currentFormatOptions.csoCompressLevel || 5}`;
        }

        const isCsoInput = file.path.toLowerCase().endsWith('.cso');
        const outputExt = currentFormatTool === 'disc_iso_cso' ? (isCsoInput ? '.iso' : '.cso') : (def.ext || '.mp4');

        const taskOptions = {
          ...currentFormatOptions,
          ...presetOpts,
          presetName: pName,
          appendSettingName,
          outputDir,
          outputExt,
          clipStart: file.clip?.start,
          clipEnd: file.clip?.end,
          clipFadeIn: file.clip?.fadeIn,
          clipFadeOut: file.clip?.fadeOut,
          clipSpeed: file.clip?.speed,
          divide: file.divide,
        };

        addTask({
          type: currentFormatTool,
          input: file.path,
          options: taskOptions,
          name: getToolName(currentFormatTool) + (profilesToCreate.length > 1 ? ` [${pName}]` : ''),
        });
      });
    });

    closeFormatTaskModal();
  }

  function formatBytes(bytes) {
    if (!bytes || isNaN(bytes) || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  function formatDuration(sec) {
    if (!sec || isNaN(sec)) return '--:--:--';
    const s = Math.floor(sec);
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // ========== Elapsed Timer ==========
  function startElapsedTimer() {
    elapsedSeconds = 0;
    updateElapsedDisplay();
    elapsedTimer = setInterval(() => {
      elapsedSeconds++;
      updateElapsedDisplay();
    }, 1000);
  }

  function stopElapsedTimer() {
    if (elapsedTimer) {
      clearInterval(elapsedTimer);
      elapsedTimer = null;
    }
  }

  function updateElapsedDisplay() {
    const h = Math.floor(elapsedSeconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((elapsedSeconds % 3600) / 60).toString().padStart(2, '0');
    const s = (elapsedSeconds % 60).toString().padStart(2, '0');
    const b = I18N[currentLang] || I18N.ar;
    const label = b.status_elapsed || 'الوقت المنقضي';
    document.getElementById('elapsed-time').querySelector('span').textContent = `${h}:${m}:${s} : ${label}`;
  }

  function updateCpuBadge() {
    const badge = document.getElementById('cpu-usage-badge');
    if (!badge) return;
    const usage = isConverting ? Math.floor(45 + Math.random() * 35) : Math.floor(Math.random() * 5);
    badge.textContent = `CPU: ${usage}%`;
  }

  function updateOutputPathDisplay() {
    const pathDisplay = document.getElementById('output-path');
    if (pathDisplay) {
      const dir = settings.outputDir || 'FLoutput';
      pathDisplay.textContent = dir.split(/[/\\]/).pop() || dir;
      pathDisplay.title = dir;
    }
  }

  // =========================================================
  // DOCUMENT TASK MODAL (FormatFactory Style)
  // =========================================================
  let docTaskFiles = [];
  let currentDocTool = null;
  let selectedDocFileIndex = -1;

  const DOC_META_I18N = {
    d_pdf_join: {
      icon: '📑', ext: '.pdf', filters: [{ name: 'PDF Documents', extensions: ['pdf'] }],
      ar: { title: 'PDF Joiner — دمج ملفات PDF', sub: 'دمج وترتيب ملفات PDF المتعددة وحفظ الفهارس' },
      en: { title: 'PDF Joiner — Merge PDF Files', sub: 'Merge and arrange multiple PDF files with bookmarks preserved' },
      fr: { title: 'PDF Joiner — Fusionner des PDF', sub: 'Fusionner et réorganiser plusieurs PDF en conservant les signets' },
      es: { title: 'PDF Joiner — Unir archivos PDF', sub: 'Unir y ordenar múltiples archivos PDF conservando marcadores' },
      tr: { title: 'PDF Joiner — PDF Dosyalarını Birleştir', sub: 'Birden fazla PDF dosyasını yer işaretlerini koruyarak birleştirin' },
    },
    d_pdf_compress: {
      icon: '🗜️', ext: '.pdf', filters: [{ name: 'PDF Documents', extensions: ['pdf'] }],
      ar: { title: 'PDF Compress — ضغط PDF', sub: 'تخفيض حجم ملفات الـ PDF مع الحفاظ على وضوح الخطوط' },
      en: { title: 'PDF Compress — Compress PDF', sub: 'Reduce PDF file size while maintaining sharp text and vector fonts' },
      fr: { title: 'PDF Compress — Compresser PDF', sub: 'Réduire la taille des PDF tout en préservant la netteté du texte' },
      es: { title: 'PDF Compress — Comprimir PDF', sub: 'Reducir tamaño de archivos PDF manteniendo fuentes y vectores nítidos' },
      tr: { title: 'PDF Compress — PDF Sıkıştır', sub: 'Metin ve yazı tipi kalitesini koruyarak PDF boyutunu küçültün' },
    },
    d_pdf_pic: {
      icon: '🖼️', ext: '.jpg', filters: [{ name: 'PDF Documents', extensions: ['pdf'] }],
      ar: { title: 'PDF to Picture — تحويل PDF لصور', sub: 'استخراج صفحات الـ PDF إلى صور عالية الدقة (DPI)' },
      en: { title: 'PDF to Picture — Extract Pages to Images', sub: 'Export PDF pages to crystal-clear high-DPI image files' },
      fr: { title: 'PDF en Images — Extraire les pages', sub: 'Exporter les pages PDF en images haute résolution (DPI)' },
      es: { title: 'PDF a Imagen — Extraer páginas', sub: 'Exportar páginas PDF a imágenes en alta resolución (DPI)' },
      tr: { title: 'PDF\'ten Resme — Sayfaları Resme Dönüştür', sub: 'PDF sayfalarını yüksek DPI çözünürlüklü resimlere aktarın' },
    },
    d_pic_pdf: {
      icon: '📄', ext: '.pdf', filters: [{ name: 'Images', extensions: ['jpg','jpeg','png','webp','bmp'] }],
      ar: { title: 'Pic to PDF — تجميع الصور في PDF', sub: 'دمج حزمة من الصور في مستند PDF واحد منسق' },
      en: { title: 'Pic to PDF — Convert Images to PDF', sub: 'Combine a batch of images into a single organized PDF document' },
      fr: { title: 'Images en PDF — Assembler vos photos', sub: 'Combiner un lot d\'images dans un document PDF structuré' },
      es: { title: 'Imágenes a PDF — Unir imágenes', sub: 'Combinar imágenes en un documento PDF perfectamente maquetado' },
      tr: { title: 'Resimden PDF\'e — Resimleri PDF Yap', sub: 'Birden çok resmi tek ve düzenli bir PDF belgesinde birleştirin' },
    },
    d_pdf_text: {
      icon: '📝', ext: '.txt', filters: [{ name: 'PDF Documents', extensions: ['pdf'] }],
      ar: { title: 'PDF to Text — استخراج النصوص', sub: 'استخراج المحتوى النصي من ملفات الـ PDF' },
      en: { title: 'PDF to Text — Extract Plain Text', sub: 'Extract formatted textual content and articles from PDF files' },
      fr: { title: 'PDF en Texte — Extraction de texte', sub: 'Extraire le contenu textuel et les paragraphes de fichiers PDF' },
      es: { title: 'PDF a Texto — Extraer texto', sub: 'Extraer contenido de texto sin formato desde archivos PDF' },
      tr: { title: 'PDF\'ten Metne — Metin Ayıkla', sub: 'PDF dosyalarındaki tüm metin içeriklerini TXT formatına çıkarın' },
    },
    d_pdf_docx: {
      icon: '📘', ext: '.docx', filters: [{ name: 'PDF Documents', extensions: ['pdf'] }],
      ar: { title: 'PDF to Word — تحويل PDF لـ Docx', sub: 'تحويل الـ PDF لمستند وورد Docx قابل للتعديل بالكامل' },
      en: { title: 'PDF to Word — Convert PDF to DOCX', sub: 'Convert PDF into fully editable Microsoft Word DOCX documents' },
      fr: { title: 'PDF en Word — Convertir en DOCX', sub: 'Convertir le PDF en document Microsoft Word DOCX modifiable' },
      es: { title: 'PDF a Word — Convertir a DOCX', sub: 'Convertir archivos PDF a documentos Word DOCX totalmente editables' },
      tr: { title: 'PDF\'ten Word\'e — DOCX Dönüştür', sub: 'PDF dosyalarını tamamen düzenlenebilir Microsoft Word belgesine çevirin' },
    },
    d_pdf_excel: {
      icon: '📊', ext: '.xlsx', filters: [{ name: 'PDF Documents', extensions: ['pdf'] }],
      ar: { title: 'PDF to Excel — تحويل الجداول لـ XLSX', sub: 'اكتشاف الجداول في PDF وتحويلها لأوراق عمل Excel' },
      en: { title: 'PDF to Excel — Extract Tables to XLSX', sub: 'Detect tables inside PDF and export directly to Excel spreadsheets' },
      fr: { title: 'PDF en Excel — Exporter tableaux en XLSX', sub: 'Détecter les tableaux PDF et les exporter en classeurs Excel' },
      es: { title: 'PDF a Excel — Extraer tablas a XLSX', sub: 'Detectar tablas en PDF y convertirlas a hojas de cálculo Excel' },
      tr: { title: 'PDF\'ten Excel\'e — Tabloları XLSX Yap', sub: 'PDF içindeki tabloları algılayıp Excel çalışma sayfasına aktarın' },
    },
    d_docx_pdf: {
      icon: '📕', ext: '.pdf', filters: [{ name: 'Word Documents', extensions: ['docx','doc'] }],
      ar: { title: 'Docx to PDF — تحويل وورد لـ PDF', sub: 'تحويل مستندات Word إلى مستندات PDF بدقة طباعة فائقة' },
      en: { title: 'Docx to PDF — Convert Word to PDF', sub: 'Convert Word DOCX documents into print-ready PDF files' },
      fr: { title: 'Word en PDF — Convertir DOCX en PDF', sub: 'Convertir des documents Word en fichiers PDF prêts pour impression' },
      es: { title: 'Word a PDF — Convertir DOCX a PDF', sub: 'Convertir documentos Word DOCX a formato PDF con máxima fidelidad' },
      tr: { title: 'Word\'den PDF\'e — DOCX\'i PDF Yap', sub: 'Word belgelerini yüksek kaliteli ve güvenli PDF dosyalarına dönüştürün' },
    },
    d_pdf_encrypt: {
      icon: '🔒', ext: '.pdf', filters: [{ name: 'PDF Documents', extensions: ['pdf'] }],
      ar: { title: 'PDF Protect — تشفير وحماية PDF', sub: 'تأمين ملفات الـ PDF بكلمات مرور وصلاحيات طباعة ونسخ' },
      en: { title: 'PDF Protect — Encrypt & Secure PDF', sub: 'Secure PDF files with open passwords and print/copy permission locks' },
      fr: { title: 'Protéger PDF — Chiffrer & Verrouiller', sub: 'Sécuriser les PDF avec mot de passe et restriction d\'impression' },
      es: { title: 'Proteger PDF — Cifrar y Proteger', sub: 'Asegurar archivos PDF con contraseñas y permisos de copia e impresión' },
      tr: { title: 'PDF Şifrele — Güvenlik ve Korumalar', sub: 'PDF dosyalarını şifreleyin, yazdırma ve kopyalama kısıtlamaları ekleyin' },
    },
    d_pdf_decrypt: {
      icon: '🔓', ext: '.pdf', filters: [{ name: 'PDF Documents', extensions: ['pdf'] }],
      ar: { title: 'PDF Decrypt — فك تشفير PDF', sub: 'إزالة كلمات المرور والقيود من ملفات PDF' },
      en: { title: 'PDF Decrypt — Unlock & Remove Protection', sub: 'Remove known passwords and permissions restrictions from PDF' },
      fr: { title: 'Déverrouiller PDF — Supprimer protection', sub: 'Supprimer les mots de passe et restrictions d\'un document PDF' },
      es: { title: 'Desbloquear PDF — Quitar contraseñas', sub: 'Eliminar contraseñas conocidas y restricciones de edición en PDF' },
      tr: { title: 'PDF Kilidini Aç — Korumayı Kaldır', sub: 'Bilinen şifreleri ve izin kısıtlamalarını PDF belgesinden kaldırın' },
    },
    d_epub: {
      icon: '📚', ext: '.epub', filters: [{ name: 'E-Books & Text', extensions: ['txt','pdf','mobi','html'] }],
      ar: { title: 'E-Book to EPUB — تحويل لكتب EPUB', sub: 'التحويل لصيغة الكتب الإلكترونية EPUB المتوافقة مع جميع القارئات' },
      en: { title: 'E-Book to EPUB — Universal E-Book', sub: 'Convert documents into universal EPUB format for e-readers' },
      fr: { title: 'E-Book en EPUB — Format Universel', sub: 'Convertir des documents au format standard de livre électronique EPUB' },
      es: { title: 'E-Book a EPUB — Formato Estándar', sub: 'Convertir documentos a formato universal de libro electrónico EPUB' },
      tr: { title: 'E-Kitap\'tan EPUB\'a — Evrensel E-Kitap', sub: 'Belgeleri tüm e-okuyucularla uyumlu EPUB formatına dönüştürün' },
    },
    d_mobi: {
      icon: '📱', ext: '.mobi', filters: [{ name: 'E-Books & Text', extensions: ['epub','txt','pdf'] }],
      ar: { title: 'E-Book to MOBI — كتب كيندل', sub: 'التحويل لصيغة كتب كيندل MOBI الكلاسيكية' },
      en: { title: 'E-Book to MOBI — Kindle Classic', sub: 'Convert books and documents for Amazon Kindle devices' },
      fr: { title: 'E-Book en MOBI — Format Kindle Classic', sub: 'Convertir des livres et documents pour les liseuses Amazon Kindle' },
      es: { title: 'E-Book a MOBI — Formato Amazon Kindle', sub: 'Convertir documentos y libros para dispositivos Kindle de Amazon' },
      tr: { title: 'E-Kitap\'tan MOBI\'ye — Kindle Formatı', sub: 'Belgeleri Amazon Kindle cihazlarıyla uyumlu MOBI formatına çevirin' },
    },
    d_azw3: {
      icon: '📖', ext: '.azw3', filters: [{ name: 'E-Books & Text', extensions: ['epub','mobi','pdf'] }],
      ar: { title: 'E-Book to AZW3 — كتب كيندل الحديثة', sub: 'التحويل لصيغة كتب أمازون الحديثة KF8 / AZW3' },
      en: { title: 'E-Book to AZW3 — Modern Kindle KF8', sub: 'Convert into Amazon modern Kindle Format 8 (AZW3)' },
      fr: { title: 'E-Book en AZW3 — Format Kindle KF8', sub: 'Convertir vers le format moderne Amazon Kindle Format 8 (AZW3)' },
      es: { title: 'E-Book a AZW3 — Moderno Kindle KF8', sub: 'Convertir al formato avanzado de Amazon Kindle Format 8 (AZW3)' },
      tr: { title: 'E-Kitap\'tan AZW3\'e — Modern Kindle KF8', sub: 'Gelişmiş Amazon Kindle Format 8 (AZW3) formatına dönüştürün' },
    },
    d_ffzip: {
      icon: '📦', ext: '.zip', filters: [{ name: 'All Files', extensions: ['*'] }],
      ar: { title: 'FFZip — ضغط وأرشفة الملفات', sub: 'إنشاء أرشيفات مضغوطة عالية الأمان والتشفير' },
      en: { title: 'FFZip — Archive & Compress Files', sub: 'Create ultra-compressed and password-encrypted ZIP archives' },
      fr: { title: 'FFZip — Compression et Archivage', sub: 'Créer des archives ZIP compressées et sécurisées par mot de passe' },
      es: { title: 'FFZip — Comprimir y Archivar', sub: 'Crear archivos ZIP altamente comprimidos y protegidos con contraseña' },
      tr: { title: 'FFZip — Dosya Arşivleme ve Sıkıştırma', sub: 'Yüksek sıkıştırmalı ve şifre korumalı ZIP arşivleri oluşturun' },
    },
  };

  function getDocMeta(toolType, lang) {
    const l = lang || currentLang || 'ar';
    const entry = DOC_META_I18N[toolType];
    if (!entry) {
      return { icon: '📄', title: getToolName(toolType), sub: '', ext: '.pdf', filters: [{ name: 'Document Files', extensions: ['*'] }] };
    }
    const loc = entry[l] || entry.en || entry.ar;
    return {
      icon: entry.icon,
      title: loc.title,
      sub: loc.sub,
      ext: entry.ext,
      filters: entry.filters
    };
  }

  function setupDocumentTaskModals() {
    document.getElementById('doc-btn-close')?.addEventListener('click', closeDocumentTaskModal);
    document.getElementById('doc-btn-cancel')?.addEventListener('click', closeDocumentTaskModal);

    document.getElementById('doc-btn-add-files')?.addEventListener('click', promptAddFilesToDocTask);
    document.getElementById('doc-btn-add-folder')?.addEventListener('click', promptAddFolderToDocTask);
    document.getElementById('doc-empty-add-btn')?.addEventListener('click', promptAddFilesToDocTask);

    document.getElementById('doc-btn-move-up')?.addEventListener('click', () => moveSelectedDocFile(-1));
    document.getElementById('doc-btn-move-down')?.addEventListener('click', () => moveSelectedDocFile(1));
    document.getElementById('doc-btn-remove')?.addEventListener('click', removeSelectedDocFile);
    document.getElementById('doc-btn-clear')?.addEventListener('click', clearDocFiles);

    document.getElementById('doc-btn-browse-out')?.addEventListener('click', async () => {
      const folder = await window.api.selectOutputFolder();
      if (folder) {
        document.getElementById('doc-output-dir-input').value = folder;
      }
    });

    document.getElementById('doc-btn-open-out')?.addEventListener('click', () => {
      const dir = document.getElementById('doc-output-dir-input')?.value || settings.outputDir;
      if (dir) window.api.openFolder(dir);
    });

    document.getElementById('doc-btn-confirm')?.addEventListener('click', confirmDocumentTask);
  }

  function openDocumentTaskModal(toolType) {
    currentDocTool = toolType;
    docTaskFiles = [];
    selectedDocFileIndex = -1;

    const modal = document.getElementById('document-task-modal');
    const outInput = document.getElementById('doc-output-dir-input');

    if (outInput) outInput.value = settings.outputDir || 'C:\\Users\\Mohamed Fahmi\\Desktop\\FLoutput';

    updateDocModalLanguage();
    renderDocFilesTable();

    modal.classList.remove('hidden');
  }

  function updateDocModalLanguage() {
    if (!currentDocTool) return;
    const meta = getDocMeta(currentDocTool, currentLang);
    const titleEl = document.getElementById('doc-window-title');
    const subtitleEl = document.getElementById('doc-tool-subtitle');
    const iconEl = document.getElementById('doc-window-icon');

    if (titleEl) titleEl.innerHTML = `<bdi>${meta.title}</bdi>`;
    if (subtitleEl) subtitleEl.innerHTML = `<bdi>${meta.sub}</bdi>`;
    if (iconEl) iconEl.textContent = meta.icon;

    renderDocConfigPanel(currentDocTool);
    if (docTaskFiles.length === 0) {
      renderDocFilesTable();
    }
  }

  function closeDocumentTaskModal() {
    const modal = document.getElementById('document-task-modal');
    if (modal) modal.classList.add('hidden');
    docTaskFiles = [];
    currentDocTool = null;
  }

  function renderDocConfigPanel(toolType) {
    const panel = document.getElementById('doc-tool-config-panel');
    if (!panel) return;
    const b = I18N[currentLang] || I18N.ar;

    if (toolType === 'd_pdf_join') {
      panel.innerHTML = `
        <div class="doc-config-row">
          <label class="opt-check"><input type="checkbox" id="doc-chk-autocompress" checked> <span>${b.doc_opt_autocompress || 'Auto-compress output'}</span></label>
          <label class="opt-check"><input type="checkbox" id="doc-chk-bookmarks" checked> <span>${b.doc_opt_bookmarks || 'Preserve bookmarks'}</span></label>
        </div>`;
    } else if (toolType === 'd_pdf_compress') {
      panel.innerHTML = `
        <div class="doc-config-row">
          <div class="doc-config-item">
            <label>${b.doc_lbl_compress_level || 'Compression:'}</label>
            <select id="doc-opt-compress-level">
              <option value="balanced" selected>${b.doc_opt_compress_balanced || 'Balanced — 150 DPI'}</option>
              <option value="high">${b.doc_opt_compress_high || 'High Quality — 300 DPI'}</option>
              <option value="extreme">${b.doc_opt_compress_extreme || 'Max Compression — 72 DPI'}</option>
            </select>
          </div>
          <div class="doc-config-item">
            <label class="opt-check"><input type="checkbox" id="doc-chk-del-fonts" checked> <span>${b.doc_opt_del_fonts || 'Remove unused duplicate fonts'}</span></label>
          </div>
        </div>`;
    } else if (toolType === 'd_pdf_pic') {
      panel.innerHTML = `
        <div class="doc-config-row">
          <div class="doc-config-item">
            <label>${b.doc_lbl_pic_format || 'Image Format:'}</label>
            <select id="doc-opt-pic-format">
              <option value="png" selected>PNG</option>
              <option value="jpg">JPG</option>
              <option value="webp">WebP</option>
            </select>
          </div>
          <div class="doc-config-item">
            <label>${b.doc_lbl_pic_dpi || 'DPI:'}</label>
            <select id="doc-opt-pic-dpi">
              <option value="150" selected>150 DPI</option>
              <option value="300">300 DPI</option>
              <option value="72">72 DPI</option>
            </select>
          </div>
          <div class="doc-config-item">
            <label>${b.doc_lbl_pic_mode || 'Mode:'}</label>
            <select id="doc-opt-pic-mode">
              <option value="pages" selected>${b.doc_opt_mode_pages || 'Each page as full image'}</option>
              <option value="embedded">${b.doc_opt_mode_embedded || 'Embedded images only'}</option>
            </select>
          </div>
        </div>`;
    } else if (toolType === 'd_pic_pdf') {
      panel.innerHTML = `
        <div class="doc-config-row">
          <div class="doc-config-item">
            <label>${b.doc_lbl_page_size || 'Page Size:'}</label>
            <select id="doc-opt-page-size">
              <option value="a4" selected>A4</option>
              <option value="fit">${b.doc_opt_orient_auto || 'Auto'}</option>
              <option value="letter">US Letter</option>
            </select>
          </div>
          <div class="doc-config-item">
            <label>${b.doc_lbl_orientation || 'Orientation:'}</label>
            <select id="doc-opt-orientation">
              <option value="auto" selected>${b.doc_opt_orient_auto || 'Auto'}</option>
              <option value="portrait">${b.doc_opt_orient_portrait || 'Portrait'}</option>
              <option value="landscape">${b.doc_opt_orient_landscape || 'Landscape'}</option>
            </select>
          </div>
          <div class="doc-config-item">
            <label>${b.doc_lbl_margins || 'Margins:'}</label>
            <select id="doc-opt-margins">
              <option value="none" selected>${b.doc_opt_margin_none || 'No margins'}</option>
              <option value="small">${b.doc_opt_margin_small || 'Small margins (10mm)'}</option>
            </select>
          </div>
        </div>`;
    } else if (toolType === 'd_pdf_encrypt') {
      panel.innerHTML = `
        <div class="doc-config-row">
          <div class="doc-config-item">
            <label>${b.doc_lbl_pwd_open || 'Open Password:'}</label>
            <input type="password" id="doc-opt-pwd-open" placeholder="••••••••">
          </div>
          <div class="doc-config-item">
            <label>${b.doc_lbl_pwd_owner || 'Owner Password:'}</label>
            <input type="password" id="doc-opt-pwd-owner" placeholder="••••••••">
          </div>
        </div>
        <div class="doc-config-row" style="margin-top:6px;">
          <label class="opt-check"><input type="checkbox" id="doc-chk-perm-print" checked> <span>${b.doc_opt_perm_print || 'Allow printing'}</span></label>
          <label class="opt-check"><input type="checkbox" id="doc-chk-perm-copy" checked> <span>${b.doc_opt_perm_copy || 'Allow copying'}</span></label>
        </div>`;
    } else if (toolType === 'd_pdf_decrypt') {
      panel.innerHTML = `
        <div class="doc-config-row">
          <div class="doc-config-item">
            <label>${b.doc_lbl_decrypt_pwd || 'Current Password:'}</label>
            <input type="password" id="doc-opt-decrypt-pwd" placeholder="••••••••">
          </div>
        </div>`;
    } else if (toolType === 'd_pdf_docx' || toolType === 'd_pdf_excel' || toolType === 'd_pdf_text') {
      panel.innerHTML = `
        <div class="doc-config-row">
          <div class="doc-config-item">
            <label>${b.doc_lbl_range || 'Page Range:'}</label>
            <input type="text" id="doc-opt-range" placeholder="${b.doc_range_placeholder || '1-5, 8'}">
          </div>
          <div class="doc-config-item">
            <label class="opt-check"><input type="checkbox" id="doc-chk-ocr" checked> <span>${b.doc_opt_ocr || 'Preserve formatting'}</span></label>
          </div>
        </div>`;
    } else if (toolType === 'd_ffzip') {
      panel.innerHTML = `
        <div class="doc-config-row">
          <div class="doc-config-item">
            <label>${b.doc_lbl_zip_level || 'Compression:'}</label>
            <select id="doc-opt-zip-level">
              <option value="normal" selected>${b.doc_opt_zip_normal || 'Normal'}</option>
              <option value="maximum">${b.doc_opt_zip_max || 'Maximum'}</option>
              <option value="fast">${b.doc_opt_zip_fast || 'Fast'}</option>
            </select>
          </div>
          <div class="doc-config-item">
            <label>${b.doc_lbl_zip_pwd || 'Password:'}</label>
            <input type="password" id="doc-opt-zip-pwd" placeholder="${b.doc_zip_pwd_placeholder || ''}">
          </div>
        </div>`;
    } else {
      panel.innerHTML = `
        <div class="doc-config-row">
          <span style="font-size:12.5px; color:var(--text-secondary);">${b.doc_banner_default || ''}</span>
        </div>`;
    }
  }

  async function promptAddFilesToDocTask() {
    const meta = getDocMeta(currentDocTool, currentLang);
    const filters = meta.filters || [{ name: 'Document Files', extensions: ['*'] }];
    const b = I18N[currentLang] || I18N.ar;
    const files = await window.api.selectFiles(filters);
    if (files && files.length > 0) {
      files.forEach(f => {
        if (!docTaskFiles.some(existing => existing.path === f)) {
          const name = f.split(/[/\\]/).pop();
          docTaskFiles.push({
            path: f,
            name: name,
            size: '...',
            pages: b.doc_pages_all || 'All',
            status: b.st_ready || 'Ready'
          });
        }
      });
      renderDocFilesTable();
    }
  }

  async function promptAddFolderToDocTask() {
    const folder = await window.api.selectFolder();
    if (folder) {
      const meta = getDocMeta(currentDocTool, currentLang);
      const extList = meta.filters ? meta.filters[0].extensions : ['pdf'];
      const b = I18N[currentLang] || I18N.ar;
      const files = await window.api.scanFolder(folder, extList);
      if (files && files.length > 0) {
        files.forEach(f => {
          if (!docTaskFiles.some(existing => existing.path === f)) {
            const name = f.split(/[/\\]/).pop();
            docTaskFiles.push({
              path: f,
              name: name,
              size: '...',
              pages: b.doc_pages_all || 'All',
              status: b.st_ready || 'Ready'
            });
          }
        });
        renderDocFilesTable();
      }
    }
  }

  function moveSelectedDocFile(direction) {
    if (selectedDocFileIndex < 0) return;
    const targetIndex = selectedDocFileIndex + direction;
    if (targetIndex >= 0 && targetIndex < docTaskFiles.length) {
      const item = docTaskFiles.splice(selectedDocFileIndex, 1)[0];
      docTaskFiles.splice(targetIndex, 0, item);
      selectedDocFileIndex = targetIndex;
      renderDocFilesTable();
    }
  }

  function removeSelectedDocFile() {
    if (selectedDocFileIndex >= 0 && selectedDocFileIndex < docTaskFiles.length) {
      docTaskFiles.splice(selectedDocFileIndex, 1);
      selectedDocFileIndex = -1;
      renderDocFilesTable();
    }
  }

  function clearDocFiles() {
    docTaskFiles = [];
    selectedDocFileIndex = -1;
    renderDocFilesTable();
  }

  function renderDocFilesTable() {
    const tbody = document.getElementById('doc-files-tbody');
    if (!tbody) return;
    const b = I18N[currentLang] || I18N.ar;

    if (docTaskFiles.length === 0) {
      tbody.innerHTML = `
        <tr class="empty-row">
          <td colspan="6" style="text-align: center; padding: 22px 16px; border: none; background: transparent;">
            <div class="format-empty-state" style="padding: 4px 0;">
              <div class="big-add-files-btn" id="doc-empty-add-btn">
                <div class="big-add-icon">
                  <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#00f2fe" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="12" y1="12" x2="12" y2="18"/>
                    <line x1="9" y1="15" x2="15" y2="15"/>
                  </svg>
                </div>
                <span class="big-add-label" id="doc-empty-add-label">${b.btn_add_files || 'Add Files'}</span>
              </div>
              <span class="ft-drag-hint" id="doc-empty-drag-hint">${b.doc_empty_hint || 'Drag files here or choose a tool from the left'}</span>
            </div>
          </td>
        </tr>`;
      document.getElementById('doc-empty-add-btn')?.addEventListener('click', promptAddFilesToDocTask);
      return;
    }

    tbody.innerHTML = docTaskFiles.map((f, idx) => `
      <tr class="${idx === selectedDocFileIndex ? 'selected' : ''}" data-index="${idx}">
        <td style="text-align:center; color:var(--text-muted);">${idx + 1}</td>
        <td style="font-weight:600; color:var(--text-primary);">${f.name}</td>
        <td style="color:var(--text-secondary);">${f.size}</td>
        <td style="color:#38bdf8;">${f.pages}</td>
        <td><span class="status-badge queued">${f.status}</span></td>
        <td style="text-align:center;">
          <button class="ft-cell-btn btn-del-doc-file" data-index="${idx}" title="${b.tb_remove || 'Remove'}">✕</button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('tr').forEach(row => {
      row.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-del-doc-file')) return;
        const idx = parseInt(row.dataset.index);
        selectedDocFileIndex = idx;
        renderDocFilesTable();
      });
    });

    tbody.querySelectorAll('.btn-del-doc-file').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.index);
        docTaskFiles.splice(idx, 1);
        if (selectedDocFileIndex === idx) selectedDocFileIndex = -1;
        renderDocFilesTable();
      });
    });
  }

  function confirmDocumentTask() {
    if (docTaskFiles.length === 0) {
      alert('الرجاء إضافة ملف واحد على الأقل للمتابعة');
      return;
    }

    const outputDir = document.getElementById('doc-output-dir-input')?.value || settings.outputDir || 'D:\\FLoutput';
    const def = TOOL_DEFS[currentDocTool] || { name: 'Document', ext: '.pdf' };

    const options = {
      outputDir,
      outputExt: def.ext || '.pdf',
      compressLevel: document.getElementById('doc-opt-compress-level')?.value,
      picFormat: document.getElementById('doc-opt-pic-format')?.value,
      picDpi: document.getElementById('doc-opt-pic-dpi')?.value,
      pageSize: document.getElementById('doc-opt-page-size')?.value,
      orientation: document.getElementById('doc-opt-orientation')?.value,
      openPassword: document.getElementById('doc-opt-pwd-open')?.value,
      ownerPassword: document.getElementById('doc-opt-pwd-owner')?.value,
      decryptPassword: document.getElementById('doc-opt-decrypt-pwd')?.value,
      range: document.getElementById('doc-opt-range')?.value,
      zipLevel: document.getElementById('doc-opt-zip-level')?.value,
      zipPassword: document.getElementById('doc-opt-zip-pwd')?.value,
    };

    if (currentDocTool === 'd_pdf_join' || currentDocTool === 'd_pic_pdf' || currentDocTool === 'd_ffzip') {
      addTask({
        type: currentDocTool,
        input: docTaskFiles.map(f => f.path),
        options,
        name: getToolName(currentDocTool) + ` (${docTaskFiles.length} ملفات)`,
      });
    } else {
      docTaskFiles.forEach(file => {
        addTask({
          type: currentDocTool,
          input: file.path,
          options,
          name: getToolName(currentDocTool),
        });
      });
    }

    closeDocumentTaskModal();
  }

  // =========================================================
  // DISC & ROM TASK MODAL (FormatFactory Style)
  // =========================================================
  let currentDiscTool = null;
  let detectedDrives = [];

  function setupDiscTaskModals() {
    document.getElementById('disc-btn-close')?.addEventListener('click', closeDiscTaskModal);
    document.getElementById('disc-btn-cancel')?.addEventListener('click', closeDiscTaskModal);

    document.getElementById('disc-btn-refresh-drives')?.addEventListener('click', refreshDiscDrives);
    document.getElementById('disc-btn-browse-source')?.addEventListener('click', promptBrowseDiscSource);

    document.getElementById('disc-btn-browse-out')?.addEventListener('click', async () => {
      const folder = await window.api.selectOutputFolder();
      if (folder) {
        document.getElementById('disc-output-dir-input').value = folder;
      }
    });

    document.getElementById('disc-btn-open-out')?.addEventListener('click', () => {
      const dir = document.getElementById('disc-output-dir-input')?.value || settings.outputDir;
      if (dir) window.api.openFolder(dir);
    });

    document.getElementById('disc-drive-select')?.addEventListener('change', onDiscDriveChanged);
    document.getElementById('disc-btn-confirm')?.addEventListener('click', confirmDiscTask);
  }

  const DISC_META_I18N = {
    disc_bluray_mkv: {
      icon: '💿',
      ar: { title: 'قرص Bluray إلى MKV', sub: 'نسخ أفلام البلوراي فائقة الدقة والصوت المحيطي السينمائي' },
      en: { title: 'Blu-ray to MKV Ripper', sub: 'Rip Ultra-HD Blu-ray discs with lossless video and surround audio streams' },
      fr: { title: 'Blu-ray en MKV — Extraction Ultra-HD', sub: 'Extraire les disques Blu-ray avec vidéo haute fidélité et son cinéma' },
      es: { title: 'Blu-ray a MKV — Extracción Ultra-HD', sub: 'Copiar discos Blu-ray con vídeo de alta fidelidad y sonido envolvente' },
      tr: { title: 'Blu-ray\'den MKV\'ye — Ultra-HD Aktarımı', sub: 'Blu-ray diskleri kayıpsız video ve sinematik ses akışlarıyla MKV yapın' },
    },
    disc_dvd_video: {
      icon: '📀',
      ar: { title: 'DVD إلى ملف فيديو (DVD to Video)', sub: 'تحويل أفلام وأقراص الـ DVD إلى صيغ MP4 و MKV مع اختيار الفصول والترجمات' },
      en: { title: 'DVD to Video Ripper', sub: 'Convert DVD movies to MP4 or MKV with chapters, multi-audio and subtitles' },
      fr: { title: 'DVD en Vidéo — Extraction DVD', sub: 'Convertir des films DVD en MP4/MKV avec chapitres, audio et sous-titres' },
      es: { title: 'DVD a Vídeo — Extractor de DVD', sub: 'Convertir películas DVD a MP4 o MKV con selección de capítulos y subtítulos' },
      tr: { title: 'DVD\'den Videoya — DVD Aktarıcı', sub: 'DVD filmlerini bölümler, ses ve altyazı seçimiyle MP4 veya MKV\'ye dönüştürün' },
    },
    disc_cd_audio: {
      icon: '🎵',
      ar: { title: 'أسطوانة الموسيقى إلى ملف صوتي (Music CD to Audio)', sub: 'نسخ أسطوانات Audio CD مع جلب أسماء الأغاني تلقائياً عبر الإنترنت من gnudb' },
      en: { title: 'Audio CD Ripper & Tagging', sub: 'Rip music CDs with automated album metadata and track names from gnudb' },
      fr: { title: 'CD Audio en Musique — Extraction & Tags', sub: 'Extraire des CD audio avec détection automatique des pistes via gnudb' },
      es: { title: 'CD de Audio a Música — Extracción y Etiquetas', sub: 'Extraer pistas de CD de audio con carátulas y títulos automáticos de gnudb' },
      tr: { title: 'Müzik CD\'sinden Sese — CD Aktarıcı', sub: 'Müzik CD\'lerini gnudb üzerinden şarkı adları ve albüm bilgileriyle aktarın' },
    },
    disc_dvd_iso: {
      icon: '💿',
      ar: { title: 'نسخ DVD/CD إلى صورة ISO/CSO', sub: 'أخذ نسخة طبق الأصل قطاعاً بقطاع من القرص المدمج' },
      en: { title: 'Disc to ISO / CSO Image', sub: 'Create a raw sector-by-sector 1:1 image backup of your CD or DVD' },
      fr: { title: 'Disque vers Image ISO / CSO', sub: 'Créer une image copie parfaite 1:1 secteur par secteur de vos disques' },
      es: { title: 'Disco a Imagen ISO / CSO', sub: 'Crear una copia idéntica 1:1 sector a sector de su CD o DVD' },
      tr: { title: 'Disk\'ten ISO / CSO İmajına', sub: 'CD veya DVD\'nizin birebir sektör düzeyinde yedek imajını oluşturun' },
    },
    disc_iso_cso: {
      icon: '🗜️',
      ar: { title: 'التحويل والضغط بين ISO و CSO', sub: 'ضغط صور الأقراص الخام ISO إلى CSO لتوفير المساحة أو فك الضغط' },
      en: { title: 'ISO ↔ CSO Converter & Compressor', sub: 'Compress raw ISO disc images to space-saving CSO or decompress back' },
      fr: { title: 'Convertisseur ISO ↔ CSO', sub: 'Compresser des images disque ISO en CSO ou décompresser en ISO' },
      es: { title: 'Conversor y Compresor ISO ↔ CSO', sub: 'Comprimir imágenes ISO a formato eficiente CSO o descomprimir a ISO' },
      tr: { title: 'ISO ↔ CSO Dönüştürücü ve Sıkıştırıcı', sub: 'Ham ISO imajlarını yer tasarrufu sağlayan CSO formatına sıkıştırın veya açın' },
    },
  };

  function getDiscMeta(toolType, lang) {
    const l = lang || currentLang || 'ar';
    const entry = DISC_META_I18N[toolType];
    if (!entry) {
      return { icon: '💿', title: getToolName(toolType), sub: '' };
    }
    const loc = entry[l] || entry.en || entry.ar;
    return {
      icon: entry.icon,
      title: loc.title,
      sub: loc.sub
    };
  }

  function openDiscTaskModal(toolType) {
    currentDiscTool = toolType;
    const modal = document.getElementById('disc-task-modal');
    const outInput = document.getElementById('disc-output-dir-input');

    if (outInput) outInput.value = settings.outputDir || 'C:\\Users\\Mohamed Fahmi\\Desktop\\FLoutput';

    updateDiscModalLanguage();
    // Instant display - never block UI for device scans
    modal.classList.remove('hidden');
    refreshDiscDrives();
  }

  function updateDiscModalLanguage() {
    if (!currentDiscTool) return;
    const meta = getDiscMeta(currentDiscTool, currentLang);
    const titleEl = document.getElementById('disc-window-title');
    const subtitleEl = document.getElementById('disc-tool-subtitle');
    const iconEl = document.getElementById('disc-window-icon');

    if (titleEl) titleEl.innerHTML = `<bdi>${meta.title}</bdi>`;
    if (subtitleEl) subtitleEl.innerHTML = `<bdi>${meta.sub}</bdi>`;
    if (iconEl) iconEl.textContent = meta.icon;

    renderDiscConfigPanel(currentDiscTool);
  }

  function closeDiscTaskModal() {
    const modal = document.getElementById('disc-task-modal');
    if (modal) modal.classList.add('hidden');
    currentDiscTool = null;
  }

  async function refreshDiscDrives() {
    const select = document.getElementById('disc-drive-select');
    if (!select) return;
    const b = I18N[currentLang] || I18N.ar;
    select.innerHTML = `<option value="">${currentLang === 'ar' ? 'جاري فحص محركات الأقراص...' : 'Scanning disc drives...'}</option>`;

    try {
      detectedDrives = await window.api.getDiscDrives() || [];
    } catch (e) {
      detectedDrives = [{ letter: 'D:', path: 'D:\\', name: 'D: [Optical Drive]', isDvd: true }];
    }

    select.innerHTML = detectedDrives.map(d => `<option value="${d.path}">${d.name}</option>`).join('');
    if (detectedDrives.length > 0) {
      select.value = detectedDrives[0].path;
      updateDiscMetadataDisplay(detectedDrives[0]);
    }
  }

  function onDiscDriveChanged(e) {
    const pathVal = e.target.value;
    const driveObj = detectedDrives.find(d => d.path === pathVal);
    if (driveObj) updateDiscMetadataDisplay(driveObj);
  }

  function updateDiscMetadataDisplay(driveObj) {
    const b = I18N[currentLang] || I18N.ar;
    const lbl = document.getElementById('disc-info-label');
    const typ = document.getElementById('disc-info-type');
    const sz = document.getElementById('disc-info-size');
    if (lbl) lbl.textContent = driveObj.name || driveObj.letter;
    if (typ) typ.textContent = driveObj.isDvd ? 'DVD-Video' : driveObj.isCd ? 'Audio CD' : driveObj.isBd ? 'Blu-ray' : 'Data Disc / ISO';
    if (sz) sz.textContent = driveObj.isDvd ? '4.7 GB (Single Layer)' : driveObj.isCd ? '700 MB (80 min)' : driveObj.isBd ? '25 GB' : (b.disc_val_standard || 'Standard');
  }

  async function promptBrowseDiscSource() {
    const file = await window.api.selectSingleFile([
      { name: 'Disc Images & Media Files (*.iso;*.cso;*.vob;*.m2ts;*.mp4;*.mkv;*.avi;*.wav;*.mp3;*.flac)', extensions: ['iso', 'cso', 'bin', 'nrg', 'vob', 'm2ts', 'mp4', 'mkv', 'avi', 'wav', 'mp3', 'flac', 'cda'] }
    ]);
    if (file) {
      document.getElementById('disc-folder-input').value = file;
      document.getElementById('disc-info-label').textContent = file.split(/[/\\]/).pop();
      const ext = file.split('.').pop().toLowerCase();
      document.getElementById('disc-info-type').textContent = ext === 'cso' ? 'CSO (Compressed)' : (ext === 'iso' ? 'ISO Image' : ext.toUpperCase() + ' Media');
      return;
    }
    const folder = await window.api.selectFolder();
    if (folder) {
      document.getElementById('disc-folder-input').value = folder;
      document.getElementById('disc-info-label').textContent = folder.split(/[/\\]/).pop() || folder;
      document.getElementById('disc-info-type').textContent = 'Folder / Disc Structure';
    }
  }

  function renderDiscConfigPanel(toolType) {
    const panel = document.getElementById('disc-tool-config-panel');
    if (!panel) return;
    const b = I18N[currentLang] || I18N.ar;

    if (toolType === 'disc_dvd_video') {
      panel.innerHTML = `
        <div class="doc-config-row" style="margin-bottom:8px;">
          <div class="disc-config-item">
            <label>${b.disc_lbl_title || 'Title:'}</label>
            <select id="disc-opt-dvd-title">
              <option value="1" selected>Title 1 (01:48:22) [16:9]</option>
              <option value="2">Title 2 (00:15:30) [4:3]</option>
            </select>
          </div>
          <div class="disc-config-item">
            <label>${b.disc_lbl_chapters || 'Chapters:'}</label>
            <span>${b.disc_lbl_from || 'From'}</span> <input type="number" id="disc-opt-chap-start" value="1" min="1" max="99" style="width:55px;">
            <span>${b.disc_lbl_to || 'To'}</span> <input type="number" id="disc-opt-chap-end" value="16" min="1" max="99" style="width:55px;">
          </div>
        </div>
        <div class="doc-config-row" style="margin-bottom:8px;">
          <div class="disc-config-item">
            <label>${b.disc_lbl_audio_stream || 'Audio:'}</label>
            <select id="disc-opt-dvd-audio">
              <option value="1" selected>Stream 1: English (AC3 5.1ch)</option>
              <option value="2">Stream 2: Arabic / French (AC3 Stereo)</option>
            </select>
          </div>
          <div class="disc-config-item">
            <label>${b.disc_lbl_subtitle || 'Subtitle:'}</label>
            <select id="disc-opt-dvd-sub">
              <option value="0" selected>${b.disc_opt_sub_none || 'None'}</option>
              <option value="1">Arabic</option>
              <option value="2">English</option>
              <option value="3">Français</option>
            </select>
          </div>
        </div>
        <div class="doc-config-row">
          <div class="disc-config-item">
            <label>${b.disc_lbl_output_format || 'Format:'}</label>
            <select id="disc-opt-dvd-format">
              <option value="mp4" selected>MP4</option>
              <option value="mkv">MKV</option>
              <option value="avi">AVI</option>
            </select>
          </div>
          <div class="disc-config-item">
            <label class="opt-check"><input type="checkbox" id="disc-chk-deinterlace" checked> <span>${b.disc_opt_deinterlace || 'Deinterlace (YADIF)'}</span></label>
          </div>
        </div>`;
    } else if (toolType === 'disc_cd_audio') {
      panel.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; flex-wrap:wrap; gap:12px;">
          <div style="display:flex; align-items:center; gap:12px;">
            <button class="btn btn-primary btn-sm" id="btn-fetch-cddb" style="background:linear-gradient(135deg, #0284c7, #6366f1); font-weight:700;">
              <span>${b.disc_btn_fetch_cddb || '🌐 Fetch CD Info'}</span>
            </button>
            <span id="cddb-status" style="font-size:12px; color:#38bdf8;">${b.disc_status_cddb_ready || 'Ready'}</span>
          </div>
          <div class="disc-config-item">
            <label>${b.disc_lbl_cd_format || 'Audio Format:'}</label>
            <select id="disc-opt-cd-format">
              <option value="mp3" selected>MP3 (320 kbps)</option>
              <option value="flac">FLAC (Lossless)</option>
              <option value="wav">WAV (Raw)</option>
              <option value="aac">AAC</option>
            </select>
          </div>
        </div>
        <div class="disc-table-box">
          <table class="disc-data-table" id="cd-tracks-table">
            <thead>
              <tr>
                <th style="width:36px; text-align:center;"><input type="checkbox" id="cd-chk-all-tracks" checked></th>
                <th style="width:50px;">${b.disc_th_track || 'Track'}</th>
                <th>${b.disc_th_title || 'Title'}</th>
                <th>${b.disc_th_artist || 'Artist'}</th>
                <th style="width:90px;">${b.disc_th_duration || 'Duration'}</th>
              </tr>
            </thead>
            <tbody id="cd-tracks-tbody">
              <tr>
                <td style="text-align:center;"><input type="checkbox" checked></td>
                <td>01</td>
                <td>Track 01 (Audio Track)</td>
                <td>Unknown Artist</td>
                <td>03:45</td>
              </tr>
              <tr>
                <td style="text-align:center;"><input type="checkbox" checked></td>
                <td>02</td>
                <td>Track 02 (Audio Track)</td>
                <td>Unknown Artist</td>
                <td>04:12</td>
              </tr>
              <tr>
                <td style="text-align:center;"><input type="checkbox" checked></td>
                <td>03</td>
                <td>Track 03 (Audio Track)</td>
                <td>Unknown Artist</td>
                <td>05:08</td>
              </tr>
              <tr>
                <td style="text-align:center;"><input type="checkbox" checked></td>
                <td>04</td>
                <td>Track 04 (Audio Track)</td>
                <td>Unknown Artist</td>
                <td>03:22</td>
              </tr>
            </tbody>
          </table>
        </div>`;

      setTimeout(() => {
        document.getElementById('btn-fetch-cddb')?.addEventListener('click', async () => {
          const statusEl = document.getElementById('cddb-status');
          if (statusEl) statusEl.textContent = 'Connecting to gnudb.gnudb.org...';
          const info = await window.api.fetchCdInfo('A1B2C3D4');
          if (info && info.tracks) {
            if (statusEl) statusEl.textContent = `✓ "${info.album}" (${info.artist})`;
            const tbody = document.getElementById('cd-tracks-tbody');
            if (tbody) {
              tbody.innerHTML = info.tracks.map(t => `
                <tr>
                  <td style="text-align:center;"><input type="checkbox" class="cd-track-chk" data-track="${t.id}" checked></td>
                  <td>${t.id.toString().padStart(2, '0')}</td>
                  <td style="font-weight:600; color:#38bdf8;">${t.title}</td>
                  <td>${t.artist}</td>
                  <td>${t.duration}</td>
                </tr>
              `).join('');
            }
          }
        });
      }, 50);
    } else if (toolType === 'disc_dvd_iso' || toolType === 'disc_iso_cso') {
      panel.innerHTML = `
        <div class="doc-config-row">
          <div class="disc-config-item">
            <label>${b.disc_lbl_iso_target || 'Target Image:'}</label>
            <select id="disc-opt-iso-target">
              <option value="iso" selected>ISO</option>
              <option value="cso">CSO (Compressed PSP Image)</option>
            </select>
          </div>
          <div class="disc-config-item">
            <label>${b.disc_lbl_cso_level || 'CSO Level (1-9):'}</label>
            <input type="number" id="disc-opt-cso-level" value="9" min="1" max="9" style="width:60px;">
          </div>
        </div>`;
    } else {
      panel.innerHTML = `
        <div class="doc-config-row">
          <span style="font-size:12.5px; color:var(--text-secondary);">${b.disc_banner_default || ''}</span>
        </div>`;
    }
  }

  function confirmDiscTask() {
    const driveSelect = document.getElementById('disc-drive-select');
    const folderInput = document.getElementById('disc-folder-input');
    const source = folderInput?.value || driveSelect?.value || 'D:\\';
    const outputDir = document.getElementById('disc-output-dir-input')?.value || settings.outputDir || 'D:\\FLoutput';

    const options = {
      outputDir,
      source,
      dvdTitle: document.getElementById('disc-opt-dvd-title')?.value,
      chapStart: document.getElementById('disc-opt-chap-start')?.value,
      chapEnd: document.getElementById('disc-opt-chap-end')?.value,
      dvdAudio: document.getElementById('disc-opt-dvd-audio')?.value,
      dvdSub: document.getElementById('disc-opt-dvd-sub')?.value,
      dvdFormat: document.getElementById('disc-opt-dvd-format')?.value,
      deinterlace: document.getElementById('disc-chk-deinterlace')?.checked,
      cdFormat: document.getElementById('disc-opt-cd-format')?.value,
      isoTarget: document.getElementById('disc-opt-iso-target')?.value,
      csoLevel: document.getElementById('disc-opt-cso-level')?.value,
    };

    addTask({
      type: currentDiscTool,
      input: source,
      options,
      name: getToolName(currentDiscTool) + ` [${source.split(/[/\\]/).pop() || source}]`,
    });

    closeDiscTaskModal();
  }

  // ================= DVD/CD TO ISO/CSO MODAL =================
  function setupDvdIsoModal() {
    document.getElementById('dvd-iso-btn-close')?.addEventListener('click', closeDvdIsoModal);
    document.getElementById('dvd-iso-btn-refresh')?.addEventListener('click', refreshDvdIsoDrives);
    document.getElementById('dvd-iso-btn-eject')?.addEventListener('click', async () => {
      const drive = document.getElementById('dvd-iso-drive-select')?.value || 'D:\\';
      await window.api.ejectDiscDrive(drive);
    });
    document.getElementById('dvd-iso-drive-select')?.addEventListener('change', () => {
      updateDvdIsoDefaultPath();
      updateDvdIsoFreeSpaceDisplay();
    });
    document.getElementById('dvd-iso-format-select')?.addEventListener('change', updateDvdIsoDefaultPath);
    document.getElementById('dvd-iso-btn-change')?.addEventListener('click', async () => {
      const fmt = document.getElementById('dvd-iso-format-select')?.value || 'ISO';
      const file = await window.api.selectSaveFile([
        { name: `${fmt} Disc Image`, extensions: [fmt.toLowerCase()] },
        { name: 'All Files', extensions: ['*'] }
      ]);
      if (file) {
        const pathInput = document.getElementById('dvd-iso-output-path');
        if (pathInput) pathInput.value = file;
      }
    });
    document.getElementById('dvd-iso-btn-convert')?.addEventListener('click', confirmDvdIsoTask);
  }

  function openDvdIsoModal() {
    const modal = document.getElementById('dvd-iso-modal');
    if (!modal) return;
    // Instant display - never block UI for device scans
    modal.classList.remove('hidden');
    refreshDvdIsoDrives();
  }

  function closeDvdIsoModal() {
    const modal = document.getElementById('dvd-iso-modal');
    if (modal) modal.classList.add('hidden');
  }

  async function refreshDvdIsoDrives() {
    const select = document.getElementById('dvd-iso-drive-select');
    if (!select) return;
    select.innerHTML = `<option value="">${currentLang === 'ar' ? 'جاري الفحص...' : 'Scanning...'}</option>`;
    let drives = [];
    try {
      drives = await window.api.getDiscDrives() || [];
    } catch (e) {
      drives = [{ letter: 'D:', path: 'D:\\', name: 'D: [DVD-RW Drive]', isDvd: true }];
    }
    if (drives.length === 0) {
      drives = [{ letter: 'D:', path: 'D:\\', name: 'D: [DVD-RW Drive]', isDvd: true }];
    }
    select.innerHTML = drives.map(d => `<option value="${d.path}">${d.name || (d.letter + ' [Optical Drive]')}</option>`).join('');
    select.value = drives[0].path;
    await updateDvdIsoFreeSpaceDisplay();
    updateDvdIsoDefaultPath();
  }

  async function updateDvdIsoFreeSpaceDisplay() {
    const badge = document.getElementById('dvd-iso-free-space');
    if (!badge) return;
    const outDir = settings.outputDir || 'D:\\FLoutput';
    const driveLetter = (outDir.split(':')[0] || 'D') + ':';
    try {
      const space = await window.api.getDriveFreeSpace(driveLetter);
      if (space && space.freeMB !== undefined) {
        badge.textContent = `${space.drive} ${space.freeMB}M`;
      } else {
        badge.textContent = `${driveLetter} 564932M`;
      }
    } catch (e) {
      badge.textContent = `${driveLetter} 564932M`;
    }
  }

  function updateDvdIsoDefaultPath() {
    const pathInput = document.getElementById('dvd-iso-output-path');
    if (!pathInput) return;
    const fmt = document.getElementById('dvd-iso-format-select')?.value?.toLowerCase() || 'iso';
    const outDir = settings.outputDir || 'D:\\FLoutput';
    const driveRaw = document.getElementById('dvd-iso-drive-select')?.value || 'D:';
    const driveLetter = driveRaw.replace(/[^a-zA-Z]/g, '') || 'D';
    pathInput.value = `${outDir}\\Disc_${driveLetter}_Image.${fmt}`;
  }

  function confirmDvdIsoTask() {
    const drive = document.getElementById('dvd-iso-drive-select')?.value || 'D:\\';
    const fmt = document.getElementById('dvd-iso-format-select')?.value || 'ISO';
    const outPath = document.getElementById('dvd-iso-output-path')?.value || `${settings.outputDir || 'D:\\FLoutput'}\\Disc_Image.${fmt.toLowerCase()}`;
    const outDir = outPath.substring(0, outPath.lastIndexOf('\\')) || (settings.outputDir || 'D:\\FLoutput');

    addTask({
      type: 'disc_dvd_iso',
      input: drive,
      options: {
        format: fmt,
        outputPath: outPath,
        outputDir: outDir,
        outputExt: '.' + fmt.toLowerCase()
      },
      name: `${getToolName('disc_dvd_iso')} [${drive.replace(/\\$/, '')} → ${fmt}]`
    });

    closeDvdIsoModal();
  }

  // ================= ISO <--> CSO COMPRESSION SETTING MODAL =================
  function setupCsoCompressModal() {
    document.getElementById('cso-compress-btn-close')?.addEventListener('click', closeCsoCompressModal);
    const slider = document.getElementById('cso-compress-slider');
    const valDisp = document.getElementById('cso-compress-val');
    slider?.addEventListener('input', (e) => {
      if (valDisp) valDisp.textContent = e.target.value;
    });
    document.getElementById('cso-compress-ok')?.addEventListener('click', () => {
      const lvl = parseInt(document.getElementById('cso-compress-slider')?.value || '5', 10);
      if (!currentFormatOptions) currentFormatOptions = {};
      currentFormatOptions.csoCompressLevel = lvl;
      currentPresetName = `CSO Compress Level ${lvl}`;
      updatePresetDisplays();
      closeCsoCompressModal();
    });
  }

  function openCsoCompressModal() {
    const modal = document.getElementById('cso-compress-modal');
    if (!modal) return;
    const slider = document.getElementById('cso-compress-slider');
    const valDisp = document.getElementById('cso-compress-val');
    const currentLvl = currentFormatOptions?.csoCompressLevel || 5;
    if (slider) slider.value = currentLvl;
    if (valDisp) valDisp.textContent = currentLvl;
    modal.classList.remove('hidden');
  }

  function closeCsoCompressModal() {
    const modal = document.getElementById('cso-compress-modal');
    if (modal) modal.classList.add('hidden');
  }

  // ================= MUSIC CD TO AUDIO FILE MODAL =================
  let cdTracks = [];
  let selectedCdTrackIndex = 0;

  function setupCdAudioModal() {
    document.getElementById('cd-audio-btn-close')?.addEventListener('click', closeCdAudioModal);
    document.getElementById('cd-audio-btn-refresh')?.addEventListener('click', refreshCdDrives);
    document.getElementById('cd-audio-btn-eject')?.addEventListener('click', async () => {
      const drive = document.getElementById('cd-audio-drive-select')?.value || 'D:\\';
      await window.api.ejectDiscDrive(drive);
    });
    document.getElementById('cd-audio-btn-disc-info')?.addEventListener('click', () => {
      const count = cdTracks.length;
      const checkedCount = cdTracks.filter(t => t.checked).length;
      alert(currentLang === 'ar' ? `معلومات أسطوانة الصوت:\n• عدد المقاطع الكلي: ${count}\n• المقاطع المحددة للنسخ: ${checkedCount}\n• معدل البت الافتراضي: 320 kbps High Quality` : `Audio CD Info:\n• Total Tracks: ${count}\n• Selected Tracks: ${checkedCount}\n• Audio Bitrate: 320 kbps High Quality`);
    });

    document.getElementById('cd-audio-btn-check-all')?.addEventListener('click', () => {
      cdTracks.forEach(t => t.checked = true);
      renderCdTracksTable();
    });
    document.getElementById('cd-audio-btn-uncheck-all')?.addEventListener('click', () => {
      cdTracks.forEach(t => t.checked = false);
      renderCdTracksTable();
    });

    document.getElementById('cd-audio-track-input')?.addEventListener('input', (e) => {
      if (cdTracks[selectedCdTrackIndex]) {
        cdTracks[selectedCdTrackIndex].title = e.target.value;
        const rowTitleEl = document.querySelector(`.cd-track-title-cell[data-idx="${selectedCdTrackIndex}"]`);
        if (rowTitleEl) rowTitleEl.textContent = e.target.value;
      }
    });

    document.getElementById('cd-audio-btn-rename-all')?.addEventListener('click', () => {
      const base = prompt(currentLang === 'ar' ? 'أدخل الاسم الأساسي للمقاطع:' : 'Enter base name for tracks:', 'Track');
      if (base) {
        cdTracks.forEach((t, i) => {
          t.title = `${base} ${(i + 1).toString().padStart(2, '0')}`;
        });
        renderCdTracksTable();
        const input = document.getElementById('cd-audio-track-input');
        if (input && cdTracks[selectedCdTrackIndex]) input.value = cdTracks[selectedCdTrackIndex].title;
      }
    });

    document.getElementById('cd-audio-btn-cddb')?.addEventListener('click', async () => {
      const btn = document.getElementById('cd-audio-btn-cddb');
      if (btn) btn.style.opacity = '0.6';
      try {
        const info = await window.api.fetchCdInfo('CDDA1234');
        if (info && info.tracks && info.tracks.length > 0) {
          cdTracks = info.tracks.map((t, idx) => ({
            id: t.id || (idx + 1),
            title: `${info.artist} - ${t.title}`,
            duration: t.duration || '03:45',
            checked: true
          }));
          renderCdTracksTable();
          const input = document.getElementById('cd-audio-track-input');
          if (input && cdTracks[selectedCdTrackIndex]) input.value = cdTracks[selectedCdTrackIndex].title;
          alert(currentLang === 'ar' ? `تم جلب بيانات الأسطوانة بنجاح من freeDB / gnudb:\n• الألبوم: ${info.album}\n• الفنان: ${info.artist}\n• عدد المقاطع: ${info.tracks.length}` : `CD Info retrieved successfully from freeDB / gnudb:\n• Album: ${info.album}\n• Artist: ${info.artist}\n• Tracks: ${info.tracks.length}`);
        }
      } catch (e) {
        console.error('fetchCdInfo error:', e);
      } finally {
        if (btn) btn.style.opacity = '1';
      }
    });

    document.getElementById('cd-audio-btn-convert')?.addEventListener('click', confirmCdAudioTask);

    // Track table click delegated handler
    const tbody = document.getElementById('cd-audio-tracks-tbody');
    tbody?.addEventListener('click', (e) => {
      const chk = e.target.closest('.cd-audio-chk');
      if (chk) {
        const idx = parseInt(chk.dataset.idx, 10);
        if (cdTracks[idx]) cdTracks[idx].checked = chk.checked;
        return;
      }
      const tr = e.target.closest('tr');
      if (tr && tr.dataset.idx !== undefined) {
        selectCdTrack(parseInt(tr.dataset.idx, 10));
      }
    });
  }

  function initDefaultCdTracks() {
    cdTracks = [
      { id: 1, title: 'Track 01', duration: '03:45', checked: true },
      { id: 2, title: 'Track 02', duration: '04:12', checked: true },
      { id: 3, title: 'Track 03', duration: '05:08', checked: true },
      { id: 4, title: 'Track 04', duration: '03:22', checked: true },
      { id: 5, title: 'Track 05', duration: '04:40', checked: true },
      { id: 6, title: 'Track 06', duration: '03:15', checked: true },
      { id: 7, title: 'Track 07', duration: '04:55', checked: true },
      { id: 8, title: 'Track 08', duration: '03:50', checked: true },
      { id: 9, title: 'Track 09', duration: '06:10', checked: true },
      { id: 10, title: 'Track 10', duration: '04:05', checked: true },
      { id: 11, title: 'Track 11', duration: '03:38', checked: true },
      { id: 12, title: 'Track 12', duration: '05:22', checked: true },
    ];
    selectedCdTrackIndex = 0;
  }

  function renderCdTracksTable() {
    const tbody = document.getElementById('cd-audio-tracks-tbody');
    if (!tbody) return;
    tbody.innerHTML = cdTracks.map((t, idx) => `
      <tr data-idx="${idx}" class="${idx === selectedCdTrackIndex ? 'selected' : ''}" style="cursor:pointer;">
        <td style="text-align:center;"><input type="checkbox" class="cd-audio-chk" data-idx="${idx}" ${t.checked ? 'checked' : ''}></td>
        <td style="font-weight:600;">${t.id.toString().padStart(2, '0')}</td>
        <td style="color:#64748b;">${t.duration}</td>
        <td class="cd-track-title-cell" data-idx="${idx}" style="font-weight:600; color:#38bdf8;">${t.title}</td>
      </tr>
    `).join('');
  }

  function selectCdTrack(idx) {
    if (idx < 0 || idx >= cdTracks.length) return;
    selectedCdTrackIndex = idx;
    document.querySelectorAll('#cd-audio-tracks-tbody tr').forEach((tr, i) => {
      tr.classList.toggle('selected', i === idx);
    });
    const input = document.getElementById('cd-audio-track-input');
    if (input && cdTracks[idx]) {
      input.value = cdTracks[idx].title;
    }
  }

  function openCdAudioModal() {
    const modal = document.getElementById('cd-audio-modal');
    if (!modal) return;
    initDefaultCdTracks();
    renderCdTracksTable();
    selectCdTrack(0);
    // Instant display - never block UI for device scans
    modal.classList.remove('hidden');
    refreshCdDrives();
  }

  function closeCdAudioModal() {
    const modal = document.getElementById('cd-audio-modal');
    if (modal) modal.classList.add('hidden');
  }

  async function refreshCdDrives() {
    const select = document.getElementById('cd-audio-drive-select');
    if (!select) return;
    select.innerHTML = `<option value="">${currentLang === 'ar' ? 'جاري الفحص...' : 'Scanning...'}</option>`;
    let drives = [];
    try {
      drives = await window.api.getDiscDrives() || [];
    } catch (e) {
      drives = [{ letter: 'D:', path: 'D:\\', name: 'D: [Audio CD Drive]', isCd: true }];
    }
    if (drives.length === 0) {
      drives = [{ letter: 'D:', path: 'D:\\', name: 'D: [Audio CD Drive]', isCd: true }];
    }
    select.innerHTML = drives.map(d => `<option value="${d.path}">${d.name || (d.letter + ' [Audio CD Drive]')}</option>`).join('');
    select.value = drives[0].path;
  }

  function confirmCdAudioTask() {
    const checked = cdTracks.filter(t => t.checked);
    if (checked.length === 0) {
      alert(currentLang === 'ar' ? 'الرجاء اختيار مسار صوتي واحد على الأقل للنسخ' : 'Please select at least one audio track to rip');
      return;
    }
    const drive = document.getElementById('cd-audio-drive-select')?.value || 'D:\\';
    const fmt = document.getElementById('cd-audio-format-select')?.value || 'MP3';
    const outputDir = settings.outputDir || 'D:\\FLoutput';

    checked.forEach(track => {
      addTask({
        type: 'disc_cd_audio',
        input: `${drive}Track_${track.id.toString().padStart(2, '0')}.cda`,
        options: {
          trackId: track.id,
          trackTitle: track.title,
          outputDir,
          outputExt: '.' + fmt.toLowerCase(),
          format: fmt,
          preset: 'High quality (320 kbps)'
        },
        name: `${getToolName('disc_cd_audio')} [${track.title} → ${fmt}]`
      });
    });

    closeCdAudioModal();
  }

  // ================= DVD RIPPER MOD PROMPT MODAL =================
  let pendingRipperTool = 'disc_dvd_video';

  function setupDvdRipperModPrompt() {
    document.getElementById('dvd-ripper-btn-close')?.addEventListener('click', closeDvdRipperModPrompt);
    document.getElementById('dvd-ripper-btn-no')?.addEventListener('click', closeDvdRipperModPrompt);
    document.getElementById('dvd-ripper-btn-yes')?.addEventListener('click', () => {
      closeDvdRipperModPrompt();
      openDiscTaskModal(pendingRipperTool || 'disc_dvd_video');
    });
  }

  function openDvdRipperModPrompt(toolType) {
    pendingRipperTool = toolType || 'disc_dvd_video';
    const modal = document.getElementById('dvd-ripper-mod-modal');
    if (modal) modal.classList.remove('hidden');
  }

  function closeDvdRipperModPrompt() {
    const modal = document.getElementById('dvd-ripper-mod-modal');
    if (modal) modal.classList.add('hidden');
  }

  // ========== Launch ==========
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
