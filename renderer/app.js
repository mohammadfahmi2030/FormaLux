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
      limitWidth: 0,
      limitHeight: 0
    },
    mw2400_mh1800: {
      name: 'Max Width 2400 Max Height 1800',
      limitWidth: 2400,
      limitHeight: 1800
    },
    mw1024_mh768: {
      name: 'Max Width 1024 Max Height 768',
      limitWidth: 1024,
      limitHeight: 768
    },
    mw640_mh480: {
      name: 'Max Width 640 Max Height 480',
      limitWidth: 640,
      limitHeight: 480
    },
    mw320_mh240: {
      name: 'Max Width 320 Max Height 240',
      limitWidth: 320,
      limitHeight: 240
    },
    mw176_mh144: {
      name: 'Max Width 176 Max Height 144',
      limitWidth: 176,
      limitHeight: 144
    },
    custom: {
      name: 'Custom Size'
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
      theme_oled: 'أسود أوليد فاحم',
      theme_cyber: 'سايبر نيون متوهج',
      theme_emerald: 'زمردي ملكي',
      theme_light: 'كلاسيكي فاتح',
      // Options Menu
      menu_settings: 'إعدادات البرنامج',
      menu_ha_test: 'اختبار تسريع العتاد',
      menu_reset_defaults: 'استعادة الضبط الافتراضي',
      // Help Menu
      menu_homepage: 'الصفحة الرئيسية',
      menu_check_updates: 'التحقق من الإصدار الجديد',
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
      empty_subtitle: 'جاهز لتحويل وسائطك بأعلى كفاءة',
      // Status bar
      status_multithread: 'تعدد المسارات',
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
      opt_context_menu: 'إضافة إلى قائمة زر الفأرة الأيمن',
      opt_check_updates: 'التحقق التلقائي من التحديثات',
      opt_minimize_tray: 'التصغير إلى صينية النظام بجوار الساعة',
      grp_gpu: 'تسريع كرت الشاشة',
      opt_gpu_auto: 'اكتشاف تسريع العتاد تلقائياً',
      btn_ha_test: 'اختبار العتاد',
      opt_gpu_desc: 'يدعم تسريع معالجات NVIDIA (NVENC)، وIntel (QuickSync)، وAMD (AMF).',
      grp_cpu: 'المعالجة المتوازية متعددة المسارات',
      opt_threads: 'استخدام التعددية المتزامنة',
      opt_show_usage: 'إظهار نسبة استهلاك المعالج في شريط الحالة',
      grp_img_quality: 'جودة حفظ الصور',
      btn_cancel: 'إلغاء',
      btn_apply: 'تطبيق',
      btn_ok: 'موافق',
      btn_add_files: 'إضافة ملفات',
      btn_add_folder: 'إضافة مجلد',
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
      t_v_separate: 'الفاصل',
      t_v_frames: 'إطارات التصدير',
      t_v_player: 'مشغل الوسائط',
      t_a_merge: 'دامج الصوت',
      t_a_split: 'فصل الصوت عن الموسيقى',
      t_a_mix: 'فصل الصوت عن الفيديو',
      t_d_pdf_join: 'دمج ملفات PDF',
      t_d_compress: 'ضغط PDF',
      t_d_pic_pdf: 'صور إلى PDF',
      t_d_pdf_pic: 'PDF إلى صور',
      t_d_pdf_text: 'PDF إلى نص',
      t_d_pdf_docx: 'PDF إلى Word',
      t_d_pdf_excel: 'PDF إلى Excel',
      t_d_docx_pdf: 'Word إلى PDF',
      t_d_decrypt: 'فك تشفير PDF',
      t_d_encrypt: 'تشفير PDF',
      t_d_zip: 'أرشيف FFZip',
      t_disc_bluray: 'قرص Bluray إلى MKV',
      t_disc_dvd: 'DVD إلى ملف فيديو',
      t_disc_cd: 'أسطوانة الموسيقى إلى صوت',
      t_disc_iso: 'DVD/CD إلى ISO/CSO',
      t_disc_cso: 'ISO ↔ CSO',
      t_util_info: 'معلومات ملف الوسائط',
      t_util_rename: 'إعادة تسمية مجمعة',
      t_util_ha: 'اختبار تسريع العتاد',
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
      t_ha_test_title: 'اختبار تسريع العتاد',
      ha_probing: 'جارٍ اختبار تسريع العتاد للمشفرات...',
      lbl_ha_supported: 'مدعوم',
      btn_retest: 'إعادة الفحص',
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
      output_format: 'صيغة الإخراج',
      output_setting: 'إعدادات الإخراج',
      video_setting_title: 'إعدادات الفيديو',
      audio_setting_title: 'إعدادات الصوت',
      picture_setting_title: 'إعدادات الصورة',
      btn_save_as: 'حفظ كقالب',
      btn_default: 'الافتراضي',
      ft_tab_files: 'الملفات المحددة',
      ft_tab_preview: 'المعاينة',
      ft_tab_mediainfo: 'معلومات الوسائط',
      th_file_info: 'الملف والمعلومات',
      th_actions: 'الخصائص والتقطيع',
      th_file_name: 'اسم الملف',
      th_size: 'الحجم',
      th_duration: 'المدة / الدقة',
      th_path: 'المسار المصدر',
      // Category Badges
      badge_video: 'فيديو',
      badge_audio: 'صوت',
      badge_picture: 'صورة',
      badge_document: 'وثيقة',
      badge_disc: 'أسطوانة',
      badge_iso_cso: 'ISO / CSO',
      // Checkbox label template
      lbl_append_setting_name: 'إضافة اسم الإعداد [{name}]',
      // Preset Display Names
      preset_optimum: 'أفضل جودة وحجم',
      preset_high_2pass: 'جودة وحجم عاليين (مرحلتين)',
      preset_high: 'جودة وحجم عاليين',
      preset_medium: 'جودة وحجم متوسطين',
      preset_low: 'جودة وحجم منخفضين',
      preset_4k: '4K فائقة الوضوح',
      preset_2k: '2K عالية الدقة',
      preset_720p: '720p عالية الدقة',
      preset_480p: '480p دقة قياسية',
      preset_copy: 'نسخ مباشر للمسار',
      preset_custom: 'تخصيص يدوي',
      preset_avc_high: 'AVC دقة عالية 1080p',
      preset_hevc_high: 'HEVC دقة عالية 1080p',
      preset_uhd_4k: '4K Ultra HD',
      preset_qhd_2k: '2K Quad HD',
      preset_audio_high: 'جودة عالية (320 ك.بت/ث)',
      preset_audio_medium: 'جودة متوسطة (192 ك.بت/ث)',
      preset_audio_low: 'جودة منخفضة (128 ك.بت/ث)',
      preset_audio_vbr_0: 'معدل متغير 0 (أعلى جودة)',
      preset_audio_vbr_high: 'معدل متغير عالي الجودة',
      preset_audio_vbr_2: 'معدل متغير 2 (جودة عالية)',
      preset_audio_vbr_medium: 'معدل متغير جودة متوسطة',
      preset_audio_vbr_4: 'معدل متغير 4 (جودة قياسية)',
      preset_audio_vbr_low: 'معدل متغير جودة منخفضة',
      preset_pic_original: 'الحجم الأصلي',
      preset_mw2400_mh1800: 'أقصى عرض 2400 أقصى ارتفاع 1800',
      preset_mw1024_mh768: 'أقصى عرض 1024 أقصى ارتفاع 768',
      preset_mw640_mh480: 'أقصى عرض 640 أقصى ارتفاع 480',
      preset_mw320_mh240: 'أقصى عرض 320 أقصى ارتفاع 240',
      preset_mw176_mh144: 'أقصى عرض 176 أقصى ارتفاع 144',
      ps_promo_1: 'إذا كنت ترغب بمزيد من الوظائف لتحرير الصور.',
      ps_promo_2: 'يرجى تحميل "Picosmos Tools"',
      preset_cso_lvl5: 'مستوى ضغط CSO 5',
      preset_ai_delogo: 'إزالة ذكية للعلامة المائية',
      badge_ai_delogo: 'إزالة ذكية',
      // Tabs
      tab_video: 'الفيديو',
      tab_audio: 'الصوت',
      tab_subtitle: 'الترجمة',
      tab_other: 'خيارات أخرى',
      tab_watermark: 'العلامة المائية',
      // Properties
      prop_size_limit: 'الحد الأقصى للحجم',
      prop_video_encode: 'ترميز الفيديو',
      prop_video_size: 'أبعاد ودقة الفيديو',
      prop_bitrate: 'معدل البت (ك.بت/ث)',
      prop_crf: 'معامل الجودة الثابت',
      prop_gpu: 'تسريع كرت الشاشة',
      prop_fps: 'معدل الإطارات بالثانية',
      prop_aspect_ratio: 'نسبة الأبعاد',
      prop_encode_2pass: 'ترميز على مرحلتين',
      prop_keyframe: 'فاصل الإطار الرئيسي',
      prop_deinterlace: 'إزالة خطوط التشابك',
      prop_rotate: 'تدوير',
      prop_xmirror: 'انعكاس أفقي',
      prop_ymirror: 'انعكاس رأسي',
      prop_filter: 'الفلتر والتأثير اللوني',
      prop_fadein: 'تلاشي للداخل',
      prop_fadeout: 'تلاشي للخارج',
      prop_antishake: 'تثبيت الاهتزاز',
      prop_denoise: 'إزالة الضوضاء والتشويش',
      prop_reverse: 'تشغيل عكسي',
      prop_audio_encode: 'ترميز الصوت',
      prop_sample_rate: 'معدل العينة (هرتز)',
      prop_audio_bitrate: 'معدل البت الصوتي (ك.بت/ث)',
      prop_channel: 'القنوات الصوتية',
      prop_disable_audio: 'تعطيل الصوت تماماً',
      prop_volume: 'مستوى الصوت',
      prop_keep_audio_streams: 'الاحتفاظ بكافة المسارات الصوتية',
      prop_echo: 'صدى الصوت',
      prop_vbr: 'معدل البت المتغير',
      prop_sample_format: 'تنسيق العينة',
      prop_keep_sub_streams: 'الاحتفاظ بمسارات الترجمة الأصلية',
      prop_add_subtitle: 'إضافة ملف ترجمة خارجي',
      prop_sub_type: 'نوع الترجمة',
      prop_sub_fontsize: 'حجم الخط',
      prop_sub_codepage: 'ترميز المحارف',
      prop_sub_fontfamily: 'نوع الخط',
      prop_sub_fontcolor: 'لون الخط',
      prop_sub_borderstyle: 'نمط الحدود والظل',
      prop_sub_outlinesize: 'سمك الإطار الخارجي',
      prop_sub_outlinecolor: 'لون الإطار الخارجي',
      prop_sub_shadowsize: 'حجم الظل',
      prop_sub_scheme: 'مخطط الألوان',
      prop_metadata: 'البيانات الوصفية',
      prop_meta_title: 'العنوان',
      prop_meta_author: 'المؤلف / الفنان',
      prop_meta_comment: 'التعليق والوصف',
      prop_stream_options: 'خيارات تدفق الويب',
      prop_faststart: 'تشغيل فوري عبر الويب',
      prop_2pass_mode: 'وضع الترميز المزدوج',
      prop_wm_enable: 'تفعيل العلامة المائية',
      prop_wm_type: 'نوع العلامة المائية',
      prop_wm_image: 'ملف الصورة',
      prop_wm_text: 'نص العلامة المائية',
      prop_wm_pos: 'الموضع في الفيديو',
      prop_wm_opacity: 'درجة الشفافية',
      prop_wm_margin: 'الهامش والمسافة',
      prop_wm_scale: 'حجم الشعار بالنسبة للفيديو',
      btn_add: 'إضافة',
      prop_max_width: 'أقصى عرض',
      prop_max_height: 'أقصى ارتفاع',
      ps_lbl_size_limit: 'تقليل حجم الملف (Size Limit)',
      ps_opt_original: 'الحجم الأصلي',
      ps_opt_custom: 'حجم مخصص',
      prop_quality: 'جودة الحفظ',
      prop_flip: 'قلب الصورة',
      lbl_jpg_quality: 'جودة JPG:',
      lbl_webp_quality: 'جودة WebP:',
      // Divide Modal
      div_title: 'تقسيم الملف',
      div_off: 'إيقاف التقسيم',
      div_by_time: 'بالمدة الزمنية',
      div_by_count: 'بعدد الملفات',
      div_by_size: 'بحجم الملف',
      // Clip Modal
      clip_title: 'قص وخيارات المقطع',
      clip_start_time: 'وقت البداية',
      clip_end_time: 'وقت النهاية',
      clip_duration: 'المدة:',
      clip_precision: 'الدقة:',
      clip_speed: 'السرعة:',
      // Multi-Profiles Modal
      mp_title: 'قوالب متعددة',
      mp_select_all: 'تحديد الكل',
      // Context Menus
      ctx_clip: 'قص وخيارات المقطع',
      ctx_divide: 'تقسيم الملف',
      ctx_preview: 'معاينة وتشغيل',
      ctx_remove: 'إزالة من القائمة',
      ctx_start: 'بدء التحويل',
      ctx_stop: 'إيقاف',
      ctx_open_folder: 'فتح مجلد الإخراج',
      ctx_clear_all: 'حذف القائمة بالكامل',
      // Document & Disc Modals
      doc_btn_move_up: 'للأعلى',
      doc_btn_move_down: 'للأسفل',
      doc_th_filename: 'اسم الملف',
      doc_th_size: 'الحجم',
      doc_th_pages: 'نطاق الصفحات',
      doc_th_status: 'الحالة',
      doc_th_action: 'إجراء',
      doc_empty_hint: 'اسحب وأفلت الملفات هنا، أو انقر على "+ إضافة ملفات"',
      doc_pages_all: 'الكل',
      st_ready: 'جاهز',
      lbl_save_folder: 'مجلد الحفظ:',
      btn_browse: 'استعراض',
      btn_open: 'فتح',
      doc_btn_confirm: 'تأكيد وإضافة للمهام',
      disc_btn_confirm: 'بدء النسخ والتحويل',
      disc_btn_refresh: 'تحديث',
      disc_lbl_drive: 'محرك الأقراص:',
      disc_lbl_or_iso: 'أو من مجلد قرص / ملف ISO على الجهاز:',
      disc_iso_placeholder: 'D:\\VIDEO_TS أو ملف ISO...',
      disc_lbl_disc: 'القرص:',
      disc_lbl_type: 'النوع:',
      disc_lbl_size: 'المساحة الإجمالية:',
      disc_val_standard: 'قياسي',
      disc_val_ready: 'جاهز للقراءة',
      disc_banner_default: 'سيتم قراءة وفحص بنية القرص وتحويل المحتوى لأعلى جودة مباشرة.',
      doc_banner_default: 'سيتم تحويل المستند وفق أعلى معايير الجودة والتوافق مع التطبيقات الأصلية.',
      doc_opt_autocompress: 'ضغط الملف المدمج تلقائياً بعد المعالجة',
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
      doc_opt_orient_portrait: 'عمودي',
      doc_opt_orient_landscape: 'أفقي',
      doc_lbl_margins: 'الهوامش:',
      doc_opt_margin_none: 'بدون هوامش (ملء الصفحة)',
      doc_opt_margin_small: 'هوامش صغيرة (10mm)',
      doc_lbl_pwd_open: 'كلمة مرور فتح الملف:',
      doc_lbl_pwd_owner: 'كلمة مرور المدير (التحكم):',
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
      disc_lbl_title: 'العنوان:',
      disc_lbl_chapters: 'الفصول:',
      disc_lbl_from: 'من',
      disc_lbl_to: 'إلى',
      disc_lbl_audio_stream: 'مسار الصوت:',
      disc_lbl_subtitle: 'الترجمة المدمجة:',
      disc_opt_sub_none: 'بدون ترجمة',
      disc_lbl_output_format: 'الصيغة الناتجة:',
      disc_opt_deinterlace: 'إزالة خطوط التشابك',
      disc_btn_fetch_cddb: '🌐 جلب معلومات الأسطوانة (gnudb)',
      disc_status_cddb_ready: 'جاهز للاتصال بقاعدة بيانات الأقراص',
      disc_lbl_cd_format: 'صيغة الصوت الناتجة:',
      disc_th_track: 'المسار',
      disc_th_title: 'عنوان المقطع',
      disc_th_artist: 'الفنان',
      disc_th_duration: 'المدة',
      disc_lbl_iso_target: 'صيغة الصورة الناتجة:',
      disc_lbl_cso_level: 'مستوى ضغط CSO (1-9):',
      t_disc_iso_title: 'DVD/CD إلى ISO/CSO',
      t_disc_cso_modal_title: 'ISO <--> CSO',
      t_disc_cd_title: 'أسطوانة الموسيقى إلى ملف صوتي',
      disc_cd_driver: 'قارئ الأقراص',
      disc_output_setting: 'إعدادات الإخراج',
      disc_high_quality: 'جودة عالية',
      disc_rename_all: 'إعادة تسمية جميع المسارات',
      disc_get_cd_info: 'جلب معلومات الأسطوانة',
      disc_compress_level: 'مستوى الضغط',
      disc_btn_change: 'تغيير',
      disc_btn_convert: 'تحويل',
      disc_ripper_mod_prompt: 'يجب تثبيت إضافة قارئ الأقراص DVDRipper. اضغط "نعم" للتثبيت.',
      btn_yes: 'نعم',
      btn_no: 'لا',
      // Video Joiner & Mux
      vmux_title: 'دامج & Mux الفيديو',
      vmux_out_format: 'صيغة الإخراج:',
      vmux_preset_optimum: 'أفضل جودة وحجم',
      vmux_tab_video: 'فيديو',
      vmux_tab_audio: 'صوت',
      vmux_col_preview: 'معاينة',
      vmux_col_info: 'معلومات الوسائط',
      vmux_btn_add_video: 'إضافة فيديو',
      vmux_btn_add_audio: 'إضافة صوت',
      vmux_btn_add_files: 'إضافة ملفات',
      vmux_btn_add_pic: 'إضافة صورة',
      vmux_btn_add_music: 'إضافة من مكتبة الموسيقى',
      vmux_vol_video: 'مستوى صوت الفيديو',
      vmux_vol_audio: 'مستوى صوت الموسيقى',
      vmux_opt_loop: 'تكرار:',
      vmux_opt_loop_yes: 'تكرار: نعم',
      vmux_opt_loop_no: 'تكرار: لا',
      vmux_opt_intervals: 'الفواصل:',
      vmux_btn_clip: 'اقتطاع',
      vmux_btn_pic: 'إضافة صورة',
      vmux_btn_add_music: 'إضافة موسيقى',
      vmux_btn_mute_tip: 'كتم / إلغاء الكتم',
      vmux_tip_ok: 'موافق وتأكيد المهمة',
      vmux_tip_close: 'إغلاق',
      vmux_tip_add_video: 'إضافة ملفات فيديو',
      vmux_tip_add_pic: 'إضافة صور',
      vmux_tip_add_audio: 'إضافة ملفات صوتية',
      vmux_tip_slider: 'سحب لضبط مستوى الصوت (0% إلى 100%)',
      vmux_tip_setting: 'إعدادات الإخراج المتقدمة',
      vmux_tip_tab_video: 'قسم الفيديو والصور',
      vmux_tip_tab_audio: 'قسم الصوت والموسيقى',
      vmux_alert_add_video_first: 'الرجاء إضافة ملف فيديو أولاً',
      vmux_alert_add_audio_first: 'الرجاء إضافة مقطع صوتي أولاً',
      // Audio Mix
      amix_title: 'مزيج صوتي (Audio Mix)',
      amix_out_format: 'صيغة الإخراج:',
      amix_preset_high: 'جودة عالية (320 ك.بت/ث)',
      amix_col_preview: 'معاينة',
      amix_col_info: 'معلومات الوسائط',
      amix_duration: 'المدة:',
      amix_dur_longest: 'الأطول (Longest)',
      amix_dur_shortest: 'الأقصر (Shortest)',
      amix_dur_first: 'الأول (First)',
      amix_duration_tip: 'تحديد مدة المزيج: حسب أطول ملف، أقصر ملف، أو مدة أول ملف',
      amix_drag_hint: 'اسحب الملفات الصوتية هنا أو اضغط لاختيارها',
      amix_tip_format: 'اختر صيغة الملف الصوتي الناتج',
      amix_tip_add_files: 'إضافة ملفات صوتية للمزيج',
      amix_tip_clear: 'مسح وتفريغ قائمة الملفات',
      amix_tip_ok: 'موافق وتأكيد المزيج',
      amix_tip_close: 'إغلاق',
      amix_tip_setting: 'إعدادات الإخراج المتقدمة',
      amix_warn_min_files: 'يرجى إضافة ملفين صوتيين على الأقل لدمجهما في المزيج',
      // Audio Joiner
      ajoin_title: 'دامج الصوت (Audio Joiner)',
      ajoin_out_format: 'صيغة الإخراج:',
      ajoin_preset_high: 'جودة عالية (320 ك.بت/ث)',
      ajoin_intervals: 'الفواصل:',
      ajoin_intervals_unit: 'ثانية',
      ajoin_intervals_tip: 'المدة الفاصلة (صمت) بالثواني بين المقطعين الصوتين',
      ajoin_drag_hint: 'اسحب الملفين الصوتين هنا أو اضغط لإضافتهما (ملفان فقط)',
      ajoin_tip_format: 'اختر صيغة الملف الصوتي الناتج عن الدمج',
      ajoin_tip_add_files: 'إضافة ملفين صوتيين للدمج',
      ajoin_tip_clear: 'مسح الملفين المحددين',
      ajoin_tip_ok: 'موافق وتأكيد دمج المقطعين',
      ajoin_tip_close: 'إغلاق',
      ajoin_tip_setting: 'إعدادات الإخراج المتقدمة',
      ajoin_warn_exact_two: 'دامج الصوت يتطلب إضافة ملفين صوتيين بالضبط (ملف أول وملف ثانٍ)',
      ajoin_warn_max_two: 'تم تحديد أول ملفين فقط؛ دامج الصوت يدمج ملفين صوتيين فقط',
      ajoin_tip_swap: 'تبديل الترتيب بين الملفين',
      tip_delete: 'حذف',
      tip_move_up: 'تحريك لأعلى',
      tip_move_down: 'تحريك لأسفل',
      tip_change_dir: 'تغيير مجلد الحفظ',
      btn_default: 'الافتراضي',
      // Screen Recorder
      sr_title: 'مسجل الشاشة',
      sr_shortcuts: 'كاميرا(F5) تسجيل(F6) إيقاف مؤقت(F7) إيقاف(F8)',
      sr_btn_camera: 'كاميرا (F5)',
      sr_btn_record: 'تسجيل (F6)',
      sr_btn_pause: 'مؤقت (F7)',
      sr_btn_stop: 'إيقاف (F8)',
      sr_region_full: 'كامل الشاشة',
      sr_region_window: 'نافذة محددة',
      sr_region_custom: 'منطقة مخصصة',
      sr_menu_region: 'تحديد منطقة من الشاشة',
      sr_menu_window: 'نافذة نشطة',
      sr_menu_fullscreen: 'كامل الشاشة',
      sr_btn_output: 'مجلد الإخراج',
      sr_chk_mic: 'استخدام الميكروفون',
      sr_chk_sound: 'التقاط صوت النظام',
      sropt_title: 'الخيارات',
      sropt_tab_system: 'النظام',
      sropt_tab_video: 'فيديو',
      sropt_tab_audio: 'صوت',
      sropt_cam_hotkey: 'مفتاح الكاميرا',
      sropt_rec_hotkey: 'مفتاح التسجيل',
      sropt_pause_hotkey: 'مفتاح الإيقاف المؤقت',
      sropt_stop_hotkey: 'مفتاح الإيقاف',
      sropt_out_format: 'صيغة الإخراج',
      sropt_out_folder: 'مجلد الإخراج',
      sropt_btn_change: 'تغيير',
      sropt_btn_open: 'فتح',
      sropt_open_after: 'بعد الانتهاء، فتح المجلد',
      sropt_always_on_top: 'النافذة دائماً في المقدمة',
      sropt_framerate: 'معدل الإطارات',
      sropt_bitrate: 'معدل البت',
      sropt_draw_mouse: 'إظهار مؤشر الفأرة',
      sropt_use_sound: 'التقاط صوت النظام',
      sropt_use_mic: 'استخدام الميكروفون',
      sropt_btn_default: 'استعادة الافتراضي',
      sr_lbl_output: 'مجلد الحفظ:',
      sr_alert_started: 'بدأ تسجيل الشاشة (F6)!',
      sr_alert_paused: 'تم إيقاف التسجيل مؤقتاً (F7)',
      sr_alert_stopped: 'تم إنهاء التسجيل وحفظ الفيديو في مجلد الإخراج (F8)',
      sr_alert_screenshot: 'تم التقاط لقطة للشاشة (F5) وحفظها بنجاح',
      // Video Downloader
      vdown_title: 'تنزيل الفيديو',
      vdown_lbl_url: 'رابط الفيديو',
      vdown_placeholder_url: 'الصق رابط يوتيوب أو فيسبوك أو تيك توك أو أي رابط فيديو هنا...',
      vdown_btn_paste: '📋 لصق الرابط',
      vdown_btn_list_formats: '≡ جلب الصيغ المتاحة',
      vdown_hint_cookies: '➔ يتطلب يوتيوب تصدير ملفات Cookies للتحميل بأعلى جودة',
      vdown_tab_main: '⚙ الإعدادات الرئيسية',
      vdown_tab_network: '🌐 الشبكة',
      vdown_tab_output: '🔀 الإخراج',
      vdown_th_property: 'الخاصية',
      vdown_th_value: 'القيمة',
      vdown_prop_format: '🛡 معرف الصيغة',
      vdown_prop_sub: '💬 الترجمة',
      vdown_prop_thumb: '🖼 الصورة المصغرة',
      vdown_prop_desc: '📝 الوصف',
      vdown_prop_json: 'JSON ملف المعلومات',
      vdown_prop_playlist: 'JSON تنزيل قائمة التشغيل',
      vdown_auth_section: '👤 بيانات تسجيل الدخول والمصادقة',
      vdown_auth_cookies_file: '🍪 ملف Cookies',
      vdown_auth_browser_cookies: '🍪 Cookies من المتصفح',
      vdown_auth_user: 'اسم المستخدم',
      vdown_auth_pass: 'كلمة المرور',
      vdown_lbl_proxy: 'عنوان خادم البروكسي (Proxy):',
      vdown_lbl_out_dir: 'مجلد حفظ الفيديوهات:',
      vdown_btn_default: '🖨 استعادة الافتراضي',
      vdown_btn_download: '⬇ بدء التنزيل',
      vdown_alert_enter_url: 'الرجاء إدخال رابط الفيديو المراد تنزيله',
      vdown_alert_formats_fetched: 'تم جلب التنسيقات المتاحة بنجاح للرابط المحدد',
      // Delogo Interactive Editor
      delogo_title: 'إزالة العلامة المائية — محرر وتتبع العلامات المائية',
      delogo_lbl_rects: 'قائمة المستطيلات والفترات الزمنية المحددة:',
      delogo_btn_ai: '✨ تتبع ذكي بالذكاء الاصطناعي (AI Auto-Track)',
      delogo_btn_add_rect: '+ إضافة مستطيل',
      delogo_btn_del_rect: '🗑 حذف',
      delogo_hint: '💡 ارسم مستطيلاً بالفأرة فوق الشعار أو اضغط "كشف وتتبع بالذكاء الاصطناعي"',
      delogo_btn_apply: 'تطبيق الإزالة',
      // Notifications & Shutdown
      opt_notify_window: 'إظهار نافذة إشعار عند اكتمال التحويل',
      notify_title: 'اكتمل التحويل',
      notify_elapsed: 'الوقت المنقضي:',
      notify_tasks_done: 'تم تحويل {count} من المهام بنجاح',
      btn_open_folder: 'مجلد الإخراج',
      shutdown_countdown_title: 'إيقاف تشغيل الكمبيوتر',
      shutdown_countdown_msg: 'اكتملت جميع المهام! سيتم إيقاف تشغيل الكمبيوتر تلقائياً بعد:',
      btn_cancel_shutdown: 'إلغاء إيقاف التشغيل',
      shutdown_cancelled: 'تم إلغاء إيقاف التشغيل بنجاح',
      lbl_files: 'ملفات',
      t_d_epub: '→ EPub',
      t_d_mobi: '→ Mobi',
      t_d_azw3: '→ AZW3',
      // Updates Modal
      updates_modal_title: 'التحقق من وجود تحديثات',
      updates_center_title: 'مركز تحديثات FormaLux',
      updates_current_ver: 'الإصدار المثبت حالياً: {version}',
      updates_checking_msg: 'جارٍ الاتصال بمستودع GitHub وفحص أحدث إصدار...',
      updates_up_to_date: 'أنت تستخدم أحدث إصدار من FormaLux 👍',
      updates_no_new: 'لا توجد تحديثات جديدة متوفرة حالياً، برنامجك محدث بالكامل.',
      updates_lbl_checked_at: 'وقت الفحص',
      updates_new_found: '🎉 يتوفر إصدار جديد جاهز للتحميل!',
      updates_ver_label: 'الإصدار الجديد:',
      updates_btn_download: 'تحميل التحديث الآن',
      updates_lbl_notes: 'ملاحظات ومميزات الإصدار الجديد:',
      updates_err_title: 'تعذر التحقق من التحديثات',
      updates_btn_retry: 'إعادة المحاولة',
      updates_btn_view_releases: 'صفحة الإصدارات على GitHub',
      // Missing UI & Modal Keys
      btn_close: 'إغلاق',
      btn_minimize: 'تصغير',
      btn_maximize: 'تكبير',
      shutdown_subdesc: 'لحفظ الطاقة وإنهاء العمل تلقائياً بعد اكتمال التحويل',
      opt_notify_window: 'إظهار نافذة إشعار عند اكتمال التحويل',
      opt_github_repo: 'مستودع GitHub:',
      t_a_extract: 'استخراج الصوت',
      t_a_tts: 'نص إلى صوت',
      btn_start_rename: 'بدء إعادة التسمية',
      th_resolution: 'الدقة',
      th_bitrate: 'معدل البت',
      about_dev_publisher: 'المطور والناشر',
      about_os_env: 'بيئة التشغيل',
      about_media_engine: 'محرك الوسائط',
      about_ha_accel: 'تسريع المعالجة',
      about_license_txt: 'الترخيص: مجاني بالكامل للجميع (Free & Open)',
      updates_err_desc: 'يرجى التأكد من اتصالك بالإنترنت.',
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
      btn_add_folder: 'Add Folder',
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
      t_v_separate: 'Audio/Video Separator',
      t_v_frames: 'Export Frames',
      t_v_player: 'Media Player',
      t_a_merge: 'Audio Joiner',
      t_a_split: 'Split Vocals & Music',
      t_a_mix: 'Extract Audio from Video',
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
      lbl_ha_supported: 'Supported',
      btn_retest: 'Retest',
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
      output_format: 'Output Format',
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
      // Category Badges
      badge_video: 'Video',
      badge_audio: 'Audio',
      badge_picture: 'Picture',
      badge_document: 'Document',
      badge_disc: 'Disc',
      badge_iso_cso: 'ISO / CSO',
      // Checkbox label template
      lbl_append_setting_name: 'Append setting name [{name}]',
      // Preset Display Names
      preset_optimum: 'Optimum quality and size',
      preset_high_2pass: 'High quality and size Encode 2 Pass',
      preset_high: 'High quality and size',
      preset_medium: 'Medium quality and size',
      preset_low: 'Low quality and size',
      preset_4k: '4K 2160p',
      preset_2k: '2K 1080p',
      preset_720p: '720p',
      preset_480p: '480p',
      preset_copy: 'Copy Stream',
      preset_custom: 'Custom',
      preset_avc_high: 'AVC High quality 1080p',
      preset_hevc_high: 'HEVC High quality 1080p',
      preset_uhd_4k: '4K Ultra HD',
      preset_qhd_2k: '2K Quad HD',
      preset_audio_high: 'High quality (320 Kbps)',
      preset_audio_medium: 'Medium quality (192 Kbps)',
      preset_audio_low: 'Low quality (128 Kbps)',
      preset_audio_vbr_0: 'VBR 0 (Best quality)',
      preset_audio_vbr_high: 'VBR High quality',
      preset_audio_vbr_2: 'VBR 2 (High quality)',
      preset_audio_vbr_medium: 'VBR Medium quality',
      preset_audio_vbr_4: 'VBR 4 (Standard quality)',
      preset_audio_vbr_low: 'VBR Low quality',
      preset_pic_original: 'Original Size',
      preset_mw2400_mh1800: 'Max Width 2400 Max Height 1800',
      preset_mw1024_mh768: 'Max Width 1024 Max Height 768',
      preset_mw640_mh480: 'Max Width 640 Max Height 480',
      preset_mw320_mh240: 'Max Width 320 Max Height 240',
      preset_mw176_mh144: 'Max Width 176 Max Height 144',
      ps_promo_1: 'If you want more functions about picture.',
      ps_promo_2: 'Please download "Picosmos Tools"',
      preset_cso_lvl5: 'CSO Compress Level 5',
      preset_ai_delogo: 'Smart Watermark Removal',
      badge_ai_delogo: 'Smart Delogo',
      // Tabs
      tab_video: 'Video',
      tab_audio: 'Audio',
      tab_subtitle: 'Subtitle',
      tab_other: 'Other',
      tab_watermark: 'Watermark',
      // Properties
      prop_size_limit: 'Size Limit',
      prop_video_encode: 'Video Encode',
      prop_video_size: 'Video Size',
      prop_bitrate: 'Bitrate (Kb/s)',
      prop_crf: 'CRF (Constant Quality)',
      prop_gpu: 'GPU Acceleration',
      prop_fps: 'FPS (Frames / Sec)',
      prop_aspect_ratio: 'Aspect Ratio',
      prop_encode_2pass: '2-Pass Encode',
      prop_keyframe: 'Keyframe Interval',
      prop_deinterlace: 'Deinterlace',
      prop_rotate: 'Rotate',
      prop_xmirror: 'X-Mirror (Horizontal)',
      prop_ymirror: 'Y-Mirror (Vertical)',
      prop_filter: 'Filter & Color',
      prop_fadein: 'Fade In',
      prop_fadeout: 'Fade Out',
      prop_antishake: 'Anti-Shake',
      prop_denoise: 'Denoise',
      prop_reverse: 'Reverse',
      prop_audio_encode: 'Audio Encode',
      prop_sample_rate: 'Sample Rate (HZ)',
      prop_audio_bitrate: 'Bitrate (Kb/s)',
      prop_channel: 'Channel',
      prop_disable_audio: 'Disable Audio',
      prop_volume: 'Volume',
      prop_keep_audio_streams: 'Keep All Audio Streams',
      prop_echo: 'Echo',
      prop_vbr: 'VBR (Variable Bitrate)',
      prop_sample_format: 'Sample Format',
      prop_keep_sub_streams: 'Keep Subtitle Streams',
      prop_add_subtitle: 'Add Subtitle File',
      prop_sub_type: 'Subtitle Type',
      prop_sub_fontsize: 'Font Size',
      prop_sub_codepage: 'CodePage',
      prop_sub_fontfamily: 'Font Family',
      prop_sub_fontcolor: 'Font Color',
      prop_sub_borderstyle: 'Border Style',
      prop_sub_outlinesize: 'Outline Size',
      prop_sub_outlinecolor: 'Outline Color',
      prop_sub_shadowsize: 'Shadow Size',
      prop_sub_scheme: 'Color Scheme',
      prop_metadata: 'Metadata',
      prop_meta_title: 'Title',
      prop_meta_author: 'Author / Artist',
      prop_meta_comment: 'Comment',
      prop_stream_options: 'Stream Options',
      prop_faststart: 'Web FastStart (MOOV)',
      prop_2pass_mode: '2-Pass Mode',
      prop_wm_enable: 'Enable Watermark',
      prop_wm_type: 'Watermark Type',
      prop_wm_image: 'Image File',
      prop_wm_text: 'Watermark Text',
      prop_wm_pos: 'Position',
      prop_wm_opacity: 'Opacity',
      prop_wm_margin: 'Margin',
      prop_wm_scale: 'Scale Size',
      btn_add: 'Add',
      prop_max_width: 'Max Width',
      prop_max_height: 'Max Height',
      ps_lbl_size_limit: 'Size Limit (Reduce File Size)',
      ps_opt_original: 'Original Size',
      ps_opt_custom: 'Custom Size',
      prop_quality: 'Quality (JPG / WebP)',
      prop_flip: 'Flip',
      lbl_jpg_quality: 'JPG Quality:',
      lbl_webp_quality: 'WebP Quality:',
      // Divide Modal
      div_title: 'Divide',
      div_off: 'Off',
      div_by_time: 'By length of time',
      div_by_count: 'By count of files',
      div_by_size: 'By size of files',
      // Clip Modal
      clip_title: 'Clip / Option',
      clip_start_time: 'Start Time',
      clip_end_time: 'End Time',
      clip_duration: 'Duration:',
      clip_precision: 'Precision:',
      clip_speed: 'Speed:',
      // Multi-Profiles Modal
      mp_title: 'Multi-Profiles',
      mp_select_all: 'Select All',
      // Context Menus
      ctx_clip: 'Clip / Option',
      ctx_divide: 'Divide',
      ctx_preview: 'Preview',
      ctx_remove: 'Remove',
      ctx_start: 'Start',
      ctx_stop: 'Stop',
      ctx_open_folder: 'Open Folder',
      ctx_clear_all: 'Clear All',
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
      // Video Joiner & Mux
      vmux_title: 'Video Joiner & Mux',
      vmux_out_format: 'Output Format:',
      vmux_preset_optimum: 'Optimum quality and size',
      vmux_tab_video: 'Video',
      vmux_tab_audio: 'Audio',
      vmux_col_preview: 'Preview',
      vmux_col_info: 'Media information',
      vmux_btn_add_video: 'Add Video',
      vmux_btn_add_audio: 'Add Audio',
      vmux_btn_add_files: 'Add Files',
      vmux_btn_add_pic: 'Add Picture',
      vmux_btn_add_music: 'Add from music library',
      vmux_vol_video: 'Video volume',
      vmux_vol_audio: 'Audio volume',
      vmux_opt_loop: 'Loop:',
      vmux_opt_loop_yes: 'Loop: Yes',
      vmux_opt_loop_no: 'Loop: No',
      vmux_opt_intervals: 'Intervals:',
      vmux_btn_clip: 'Clip',
      vmux_btn_pic: 'Add Picture',
      vmux_btn_add_music: 'Add Music',
      vmux_btn_mute_tip: 'Mute / Unmute',
      vmux_tip_ok: 'Confirm and OK',
      vmux_tip_close: 'Close',
      vmux_tip_add_video: 'Add Video Files',
      vmux_tip_add_pic: 'Add Picture Files',
      vmux_tip_add_audio: 'Add Audio Files',
      vmux_tip_slider: 'Drag to adjust volume (0% to 100%)',
      vmux_tip_setting: 'Advanced Output Settings',
      vmux_tip_tab_video: 'Video & Pictures Section',
      vmux_tip_tab_audio: 'Audio & Music Section',
      vmux_alert_add_video_first: 'Please add a video file first',
      vmux_alert_add_audio_first: 'Please add an audio file first',
      // Audio Mix
      amix_title: 'Audio Mix',
      amix_out_format: 'Output Format:',
      amix_preset_high: 'High quality (320 kbps)',
      amix_col_preview: 'Preview',
      amix_col_info: 'Media information',
      amix_duration: 'Duration:',
      amix_dur_longest: 'Longest',
      amix_dur_shortest: 'Shortest',
      amix_dur_first: 'First',
      amix_duration_tip: 'Set mix duration: based on longest track, shortest track, or first track',
      amix_drag_hint: 'Drag audio files here or click to add',
      amix_tip_format: 'Select output audio format',
      amix_tip_add_files: 'Add audio files to mix',
      amix_tip_clear: 'Clear all files from list',
      amix_tip_ok: 'Confirm and OK',
      amix_tip_close: 'Close',
      amix_tip_setting: 'Advanced Output Settings',
      amix_warn_min_files: 'Please add at least 2 audio files to mix together',
      // Audio Joiner
      ajoin_title: 'Audio Joiner',
      ajoin_out_format: 'Output Format:',
      ajoin_preset_high: 'High quality (320 kbps)',
      ajoin_intervals: 'Intervals:',
      ajoin_intervals_unit: 's',
      ajoin_intervals_tip: 'Silence interval in seconds between the two audio tracks',
      ajoin_drag_hint: 'Drag the two audio files here or click to add (2 files only)',
      ajoin_tip_format: 'Select output audio format',
      ajoin_tip_add_files: 'Add two audio files to join',
      ajoin_tip_clear: 'Clear files',
      ajoin_tip_ok: 'Confirm and Join',
      ajoin_tip_close: 'Close',
      ajoin_tip_setting: 'Advanced Output Settings',
      ajoin_warn_exact_two: 'Audio Joiner requires exactly 2 audio files (First track and Second track)',
      ajoin_warn_max_two: 'Only first 2 files selected; Audio Joiner joins only 2 audio files',
      ajoin_tip_swap: 'Swap order between tracks',
      tip_delete: 'Delete',
      tip_move_up: 'Move up',
      tip_move_down: 'Move down',
      tip_change_dir: 'Change output folder',
      btn_default: 'Default',
      // Screen Recorder
      sr_title: 'Screen Record',
      sr_shortcuts: 'Camera(F5) Record(F6) Pause(F7) Stop(F8)',
      sr_btn_camera: 'Camera (F5)',
      sr_btn_record: 'Record (F6)',
      sr_btn_pause: 'Pause (F7)',
      sr_btn_stop: 'Stop (F8)',
      sr_region_full: 'Full Screen',
      sr_region_window: 'Selected Window',
      sr_region_custom: 'Custom Region',
      sr_menu_region: 'Region screen',
      sr_menu_window: 'Window',
      sr_menu_fullscreen: 'Full screen',
      sr_btn_output: 'Output folder',
      sr_chk_mic: 'Use microphone',
      sr_chk_sound: 'Use capture sound',
      sropt_title: 'Options',
      sropt_tab_system: 'System',
      sropt_tab_video: 'Video',
      sropt_tab_audio: 'Audio',
      sropt_cam_hotkey: 'Camera HotKey',
      sropt_rec_hotkey: 'Record HotKey',
      sropt_pause_hotkey: 'Pause HotKey',
      sropt_stop_hotkey: 'Stop HotKey',
      sropt_out_format: 'Output Format',
      sropt_out_folder: 'Output Folder',
      sropt_btn_change: 'Change',
      sropt_btn_open: 'Open',
      sropt_open_after: 'After finish,open the folder',
      sropt_always_on_top: 'Window always on top',
      sropt_framerate: 'Frame rate',
      sropt_bitrate: 'Bitrate',
      sropt_draw_mouse: 'Draw mouse',
      sropt_use_sound: 'Use capture sound',
      sropt_use_mic: 'Use microphone',
      sropt_btn_default: 'Default',
      sr_lbl_output: 'Output Folder:',
      sr_alert_started: 'Screen recording started (F6)!',
      sr_alert_paused: 'Recording paused (F7)',
      sr_alert_stopped: 'Recording finished and saved to output folder (F8)',
      sr_alert_screenshot: 'Screenshot captured (F5) successfully',
      // Video Downloader
      vdown_title: 'Video Downloader',
      vdown_lbl_url: 'Video URL',
      vdown_placeholder_url: 'Paste YouTube, Facebook, TikTok, or any direct video link here...',
      vdown_btn_paste: '📋 Paste URL',
      vdown_btn_list_formats: '≡ List Available Formats',
      vdown_hint_cookies: '➔ youtube needs to export cookies files',
      vdown_tab_main: '⚙ Main',
      vdown_tab_network: '🌐 Network',
      vdown_tab_output: '🔀 Output',
      vdown_th_property: 'Property',
      vdown_th_value: 'Value',
      vdown_prop_format: '🛡 Format ID',
      vdown_prop_sub: '💬 Subtitle',
      vdown_prop_thumb: '🖼 Thumbnail',
      vdown_prop_desc: '📝 Description',
      vdown_prop_json: 'JSON Info Json',
      vdown_prop_playlist: 'JSON Download Playlist',
      vdown_auth_section: '👤 Authentication',
      vdown_auth_cookies_file: '🍪 Cookies file',
      vdown_auth_browser_cookies: '🍪 Cookies From Browser',
      vdown_auth_user: 'Username',
      vdown_auth_pass: 'Password',
      vdown_lbl_proxy: 'Proxy Server Address:',
      vdown_lbl_out_dir: 'Output Directory:',
      vdown_btn_default: '🖨 Default',
      vdown_btn_download: '⬇ Download',
      vdown_alert_enter_url: 'Please enter a video URL to download',
      vdown_alert_formats_fetched: 'Available formats retrieved successfully for the URL',
      // Delogo Interactive Editor
      delogo_title: 'Remove Watermark — Interactive Delogo & Auto-Track',
      delogo_lbl_rects: 'Selected rectangles & timeline intervals:',
      delogo_btn_ai: '✨ AI Auto-Track Watermark',
      delogo_btn_add_rect: '+ Add Rectangle',
      delogo_btn_del_rect: '🗑 Delete',
      delogo_hint: '💡 Draw a rectangle with mouse over the watermark or click "AI Auto-Track"',
      delogo_btn_apply: 'Apply & OK',
      // Notifications & Shutdown
      opt_notify_window: 'Show notification window upon completion',
      notify_title: 'Task Complete',
      notify_elapsed: 'Elapsed Time:',
      notify_tasks_done: 'Successfully completed {count} task(s)',
      btn_open_folder: 'Open Output Folder',
      shutdown_countdown_title: 'Shutting Down Computer',
      shutdown_countdown_msg: 'All tasks completed! Computer will shut down in:',
      btn_cancel_shutdown: 'Cancel Shutdown',
      shutdown_cancelled: 'Shutdown cancelled successfully',
      lbl_files: 'files',
      t_d_epub: '→ EPub',
      t_d_mobi: '→ Mobi',
      t_d_azw3: '→ AZW3',
      // Updates Modal
      updates_modal_title: 'Check for Updates',
      updates_center_title: 'FormaLux Update Center',
      updates_current_ver: 'Currently installed: {version}',
      updates_checking_msg: 'Connecting to GitHub repository and checking for latest release...',
      updates_up_to_date: 'You are using the latest version of FormaLux 👍',
      updates_no_new: 'No new updates available at this time. Your software is fully up to date.',
      updates_lbl_checked_at: 'Checked At',
      updates_new_found: '🎉 A new version is available for download!',
      updates_ver_label: 'New Version:',
      updates_btn_download: 'Download Update Now',
      updates_lbl_notes: 'Release Notes & Highlights:',
      updates_err_title: 'Unable to Check for Updates',
      updates_btn_retry: 'Retry',
      updates_btn_view_releases: 'Releases Page on GitHub',
      // Missing UI & Modal Keys
      btn_close: 'Close',
      btn_minimize: 'Minimize',
      btn_maximize: 'Maximize',
      shutdown_subdesc: 'To save power and finish work automatically after conversions',
      opt_notify_window: 'Show popup notification window on completion',
      opt_github_repo: 'GitHub Repository:',
      t_a_extract: 'Extract Audio',
      t_a_tts: 'Text to Speech',
      btn_start_rename: 'Start Renaming',
      th_resolution: 'Resolution',
      th_bitrate: 'Bitrate',
      about_dev_publisher: 'Developer & Publisher',
      about_os_env: 'Runtime Environment',
      about_media_engine: 'Media Engine',
      about_ha_accel: 'Hardware Acceleration',
      about_license_txt: 'License: Completely Free for Everyone (Free & Open)',
      updates_err_desc: 'Please check your internet connection.',
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
      btn_add_folder: 'Ajouter dossier',
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
      t_v_separate: 'Séparateur Audio/Vidéo',
      t_v_frames: 'Exporter les images',
      t_v_player: 'Lecteur Multimédia',
      t_a_merge: 'Fusionneur Audio',
      t_a_split: 'Séparer Voix et Musique',
      t_a_mix: 'Extraire l\'audio de la vidéo',
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
      lbl_ha_supported: 'Supporté',
      btn_retest: 'Tester à nouveau',
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
      output_format: 'Format de sortie',
      output_setting: 'Paramètres de sortie',
      video_setting_title: 'Paramètres Vidéo',
      audio_setting_title: 'Paramètres Audio',
      picture_setting_title: 'Paramètres Image',
      btn_save_as: 'Enregistrer sous',
      btn_default: 'Par défaut',
      ft_tab_files: 'Fichiers sélectionnés',
      ft_tab_preview: 'Aperçu',
      ft_tab_mediainfo: 'Informations média',
      th_file_info: 'Infos Fichier & Média',
      th_actions: 'Options & Découpage',
      th_file_name: 'Nom du fichier',
      th_size: 'Taille',
      th_duration: 'Durée / Résolution',
      th_path: 'Chemin source',
      // Category Badges
      badge_video: 'Vidéo',
      badge_audio: 'Audio',
      badge_picture: 'Image',
      badge_document: 'Document',
      badge_disc: 'Disque',
      badge_iso_cso: 'ISO / CSO',
      // Checkbox label template
      lbl_append_setting_name: 'Ajouter le nom du profil [{name}]',
      // Preset Display Names
      preset_optimum: 'Qualité et taille optimales',
      preset_high_2pass: 'Haute qualité et taille (2 passes)',
      preset_high: 'Haute qualité et taille',
      preset_medium: 'Qualité et taille moyennes',
      preset_low: 'Basse qualité et taille',
      preset_4k: '4K 2160p',
      preset_2k: '2K 1080p',
      preset_720p: '720p',
      preset_480p: '480p',
      preset_copy: 'Copier le flux',
      preset_custom: 'Personnalisé',
      preset_avc_high: 'AVC Haute qualité 1080p',
      preset_hevc_high: 'HEVC Haute qualité 1080p',
      preset_uhd_4k: '4K Ultra HD',
      preset_qhd_2k: '2K Quad HD',
      preset_audio_high: 'Haute qualité (320 Kbps)',
      preset_audio_medium: 'Qualité moyenne (192 Kbps)',
      preset_audio_low: 'Basse qualité (128 Kbps)',
      preset_audio_vbr_0: 'VBR 0 (Meilleure qualité)',
      preset_audio_vbr_high: 'VBR Haute qualité',
      preset_audio_vbr_2: 'VBR 2 (Haute qualité)',
      preset_audio_vbr_medium: 'VBR Qualité moyenne',
      preset_audio_vbr_4: 'VBR 4 (Qualité standard)',
      preset_audio_vbr_low: 'VBR Basse qualité',
      preset_pic_original: 'Taille originale',
      preset_pic_50: '50% Taille originale',
      preset_pic_75: '75% Taille originale',
      preset_pic_1080: '1920x1080 (Full HD)',
      preset_pic_720: '1280x720 (HD)',
      preset_pic_800: '800x600 (Web)',
      preset_pic_avatar: 'Avatar 1:1 Carré',
      preset_cso_lvl5: 'Niveau de compression CSO 5',
      preset_ai_delogo: 'Suppression intelligente du filigrane',
      badge_ai_delogo: 'Suppr. IA',
      // Tabs
      tab_video: 'Vidéo',
      tab_audio: 'Audio',
      tab_subtitle: 'Sous-titre',
      tab_other: 'Autre',
      tab_watermark: 'Filigrane',
      // Properties
      prop_size_limit: 'Limite de taille',
      prop_video_encode: 'Encodage vidéo',
      prop_video_size: 'Taille vidéo',
      prop_bitrate: 'Débit (Kb/s)',
      prop_crf: 'Qualité constante (CRF)',
      prop_gpu: 'Accélération GPU',
      prop_fps: 'Images/sec (FPS)',
      prop_aspect_ratio: 'Format d\'image',
      prop_encode_2pass: 'Encodage 2 passes',
      prop_keyframe: 'Images clés',
      prop_deinterlace: 'Désentrelacement',
      prop_rotate: 'Rotation',
      prop_xmirror: 'Miroir horizontal',
      prop_ymirror: 'Miroir vertical',
      prop_filter: 'Filtre et couleur',
      prop_fadein: 'Fondu entrant',
      prop_fadeout: 'Fondu sortant',
      prop_antishake: 'Stabilisation',
      prop_denoise: 'Réduction de bruit',
      prop_reverse: 'Lecture inversée',
      prop_audio_encode: 'Encodage audio',
      prop_sample_rate: 'Taux d\'échantillonnage (HZ)',
      prop_audio_bitrate: 'Débit audio (Kb/s)',
      prop_channel: 'Canaux audio',
      prop_disable_audio: 'Désactiver le son',
      prop_volume: 'Volume',
      prop_keep_audio_streams: 'Conserver les pistes audio',
      prop_echo: 'Écho',
      prop_vbr: 'Débit variable (VBR)',
      prop_sample_format: 'Format d\'échantillonnage',
      prop_keep_sub_streams: 'Conserver les sous-titres',
      prop_add_subtitle: 'Ajouter sous-titre',
      prop_sub_type: 'Type de sous-titre',
      prop_sub_fontsize: 'Taille de police',
      prop_sub_codepage: 'Page de code',
      prop_sub_fontfamily: 'Police',
      prop_sub_fontcolor: 'Couleur de police',
      prop_sub_borderstyle: 'Style de bordure',
      prop_sub_outlinesize: 'Taille contour',
      prop_sub_outlinecolor: 'Couleur contour',
      prop_sub_shadowsize: 'Taille ombre',
      prop_sub_scheme: 'Jeu de couleurs',
      prop_metadata: 'Métadonnées',
      prop_meta_title: 'Titre',
      prop_meta_author: 'Auteur / Artiste',
      prop_meta_comment: 'Commentaire',
      prop_stream_options: 'Options de streaming',
      prop_faststart: 'Démarrage rapide Web',
      prop_2pass_mode: 'Mode 2 passes',
      prop_wm_enable: 'Activer filigrane',
      prop_wm_type: 'Type de filigrane',
      prop_wm_image: 'Fichier image',
      prop_wm_text: 'Texte filigrane',
      prop_wm_pos: 'Position',
      prop_wm_opacity: 'Opacité',
      prop_wm_margin: 'Marge',
      prop_wm_scale: 'Échelle',
      btn_add: 'Ajouter',
      prop_max_width: 'Largeur max',
      prop_max_height: 'Hauteur max',
      ps_lbl_size_limit: 'Limite de taille',
      ps_opt_original: 'Taille originale',
      ps_opt_custom: 'Taille personnalisée',
      prop_quality: 'Qualité (JPG / WebP)',
      prop_flip: 'Retourner',
      lbl_jpg_quality: 'Qualité JPG :',
      lbl_webp_quality: 'Qualité WebP :',
      // Divide Modal
      div_title: 'Diviser',
      div_off: 'Désactivé',
      div_by_time: 'Par durée',
      div_by_count: 'Par nombre de fichiers',
      div_by_size: 'Par taille de fichier',
      // Clip Modal
      clip_title: 'Découpage / Options',
      clip_start_time: 'Début',
      clip_end_time: 'Fin',
      clip_duration: 'Durée :',
      clip_precision: 'Précision :',
      clip_speed: 'Vitesse :',
      // Multi-Profiles Modal
      mp_title: 'Profils multiples',
      mp_select_all: 'Tout sélectionner',
      // Context Menus
      ctx_clip: 'Découpage / Options',
      ctx_divide: 'Diviser',
      ctx_preview: 'Aperçu',
      ctx_remove: 'Supprimer',
      ctx_start: 'Démarrer',
      ctx_stop: 'Arrêter',
      ctx_open_folder: 'Ouvrir le dossier',
      ctx_clear_all: 'Tout vider',
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
      // Video Joiner & Mux
      vmux_title: 'Fusionner & Mux Vidéo',
      vmux_out_format: 'Format de sortie :',
      vmux_preset_optimum: 'Qualité et taille optimales',
      vmux_tab_video: 'Vidéo',
      vmux_tab_audio: 'Audio',
      vmux_col_preview: 'Aperçu',
      vmux_col_info: 'Informations média',
      vmux_btn_add_video: 'Ajouter Vidéo',
      vmux_btn_add_audio: 'Ajouter Audio',
      vmux_btn_add_files: 'Ajouter des fichiers',
      vmux_btn_add_pic: 'Ajouter une image',
      vmux_btn_add_music: 'Ajouter depuis la bibliothèque',
      vmux_vol_video: 'Volume vidéo',
      vmux_vol_audio: 'Volume audio',
      vmux_opt_loop: 'Boucle :',
      vmux_opt_loop_yes: 'Boucle : Oui',
      vmux_opt_loop_no: 'Boucle : Non',
      vmux_opt_intervals: 'Intervalles :',
      vmux_btn_clip: 'Découper',
      vmux_btn_pic: 'Ajouter image',
      vmux_btn_add_music: 'Ajouter musique',
      vmux_btn_mute_tip: 'Couper / Activer le son',
      vmux_tip_ok: 'Confirmer et OK',
      vmux_tip_close: 'Fermer',
      vmux_tip_add_video: 'Ajouter des fichiers vidéo',
      vmux_tip_add_pic: 'Ajouter des images',
      vmux_tip_add_audio: 'Ajouter des fichiers audio',
      vmux_tip_slider: 'Glisser pour ajuster le volume (0% à 100%)',
      vmux_tip_setting: 'Paramètres de sortie avancés',
      vmux_tip_tab_video: 'Section Vidéo et Images',
      vmux_tip_tab_audio: 'Section Audio et Musique',
      vmux_alert_add_video_first: 'Veuillez d\'abord ajouter un fichier vidéo',
      vmux_alert_add_audio_first: 'Veuillez d\'abord ajouter un fichier audio',
      // Audio Mix
      amix_title: 'Mixeur Audio',
      amix_out_format: 'Format de sortie :',
      amix_preset_high: 'Haute qualité (320 kbps)',
      amix_col_preview: 'Aperçu',
      amix_col_info: 'Informations média',
      amix_duration: 'Durée :',
      amix_dur_longest: 'Le plus long',
      amix_dur_shortest: 'Le plus court',
      amix_dur_first: 'Le premier',
      amix_duration_tip: 'Définir la durée du mix : selon la piste la plus longue, la plus courte ou la première',
      amix_drag_hint: 'Glissez des fichiers audio ici ou cliquez pour ajouter',
      amix_tip_format: 'Sélectionnez le format audio de sortie',
      amix_tip_add_files: 'Ajouter des fichiers audio au mix',
      amix_tip_clear: 'Vider toute la liste des fichiers',
      amix_tip_ok: 'Confirmer et OK',
      amix_tip_close: 'Fermer',
      amix_tip_setting: 'Paramètres de sortie avancés',
      amix_warn_min_files: 'Veuillez ajouter au moins 2 fichiers audio à mixer ensemble',
      // Audio Joiner
      ajoin_title: 'Fusionneur Audio',
      ajoin_out_format: 'Format de sortie :',
      ajoin_preset_high: 'Haute qualité (320 kbps)',
      ajoin_intervals: 'Intervalles :',
      ajoin_intervals_unit: 's',
      ajoin_intervals_tip: 'Intervalle de silence en secondes entre les deux pistes audio',
      ajoin_drag_hint: 'Glissez les deux fichiers audio ici ou cliquez pour ajouter (2 fichiers uniquement)',
      ajoin_tip_format: 'Sélectionnez le format audio de sortie',
      ajoin_tip_add_files: 'Ajouter deux fichiers audio à fusionner',
      ajoin_tip_clear: 'Effacer les fichiers',
      ajoin_tip_ok: 'Confirmer et Fusionner',
      ajoin_tip_close: 'Fermer',
      ajoin_tip_setting: 'Paramètres de sortie avancés',
      ajoin_warn_exact_two: 'Le fusionneur audio nécessite exactement 2 fichiers audio (Piste 1 et Piste 2)',
      ajoin_warn_max_two: 'Seuls les 2 premiers fichiers sont pris en compte ; le fusionneur n\'en fusionne que 2',
      ajoin_tip_swap: 'Inverser l\'ordre des pistes',
      tip_delete: 'Supprimer',
      tip_move_up: 'Monter',
      tip_move_down: 'Descendre',
      tip_change_dir: 'Changer le dossier de sortie',
      btn_default: 'Par défaut',
      // Screen Recorder
      sr_title: 'Enregistreur d\'écran',
      sr_shortcuts: 'Caméra(F5) Enregistrer(F6) Pause(F7) Arrêter(F8)',
      sr_btn_camera: 'Caméra (F5)',
      sr_btn_record: 'Enregistrer (F6)',
      sr_btn_pause: 'Pause (F7)',
      sr_btn_stop: 'Arrêter (F8)',
      sr_region_full: 'Plein écran',
      sr_region_window: 'Fenêtre sélectionnée',
      sr_region_custom: 'Zone personnalisée',
      sr_menu_region: 'Région de l\'écran',
      sr_menu_window: 'Fenêtre',
      sr_menu_fullscreen: 'Plein écran',
      sr_btn_output: 'Dossier de sortie',
      sr_chk_mic: 'Utiliser le microphone',
      sr_chk_sound: 'Capturer le son système',
      sropt_title: 'Options',
      sropt_tab_system: 'Système',
      sropt_tab_video: 'Vidéo',
      sropt_tab_audio: 'Audio',
      sropt_cam_hotkey: 'Raccourci caméra',
      sropt_rec_hotkey: 'Raccourci enregistrement',
      sropt_pause_hotkey: 'Raccourci pause',
      sropt_stop_hotkey: 'Raccourci arrêt',
      sropt_out_format: 'Format de sortie',
      sropt_out_folder: 'Dossier de sortie',
      sropt_btn_change: 'Modifier',
      sropt_btn_open: 'Ouvrir',
      sropt_open_after: 'Après la fin, ouvrir le dossier',
      sropt_always_on_top: 'Fenêtre toujours au premier plan',
      sropt_framerate: 'Fréquence d\'images',
      sropt_bitrate: 'Débit binaire',
      sropt_draw_mouse: 'Afficher le curseur',
      sropt_use_sound: 'Capturer le son système',
      sropt_use_mic: 'Utiliser le microphone',
      sropt_btn_default: 'Par défaut',
      sr_lbl_output: 'Dossier de sortie :',
      sr_alert_started: 'Enregistrement de l\'écran commencé (F6) !',
      sr_alert_paused: 'Enregistrement suspendu (F7)',
      sr_alert_stopped: 'Enregistrement terminé et enregistré dans le dossier de sortie (F8)',
      sr_alert_screenshot: 'Capture d\'écran (F5) effectuée avec succès',
      // Video Downloader
      vdown_title: 'Téléchargeur de vidéos',
      vdown_lbl_url: 'URL de la vidéo',
      vdown_placeholder_url: 'Collez l\'URL de YouTube, Facebook, TikTok ou tout lien vidéo direct ici...',
      vdown_btn_paste: '📋 Coller l\'URL',
      vdown_btn_list_formats: '≡ Lister les formats disponibles',
      vdown_hint_cookies: '➔ youtube nécessite d\'exporter des fichiers cookies',
      vdown_tab_main: '⚙ Principal',
      vdown_tab_network: '🌐 Réseau',
      vdown_tab_output: '🔀 Sortie',
      vdown_th_property: 'Propriété',
      vdown_th_value: 'Valeur',
      vdown_prop_format: '🛡 ID du format',
      vdown_prop_sub: '💬 Sous-titre',
      vdown_prop_thumb: '🖼 Miniature',
      vdown_prop_desc: '📝 Description',
      vdown_prop_json: 'JSON Fichier Info',
      vdown_prop_playlist: 'JSON Télécharger la playlist',
      vdown_auth_section: '👤 Authentification',
      vdown_auth_cookies_file: '🍪 Fichier Cookies',
      vdown_auth_browser_cookies: '🍪 Cookies du navigateur',
      vdown_auth_user: 'Nom d\'utilisateur',
      vdown_auth_pass: 'Mot de passe',
      vdown_lbl_proxy: 'Adresse du serveur proxy :',
      vdown_lbl_out_dir: 'Dossier de sortie :',
      vdown_btn_default: '🖨 Par défaut',
      vdown_btn_download: '⬇ Télécharger',
      vdown_alert_enter_url: 'Veuillez saisir l\'URL d\'une vidéo à télécharger',
      vdown_alert_formats_fetched: 'Formats disponibles récupérés avec succès pour l\'URL',
      // Delogo Interactive Editor
      delogo_title: 'Supprimer Filigrane — Suivi et Suppression Interactive',
      delogo_lbl_rects: 'Liste des rectangles et intervalles temporels :',
      delogo_btn_ai: '✨ Suivi Automatique IA',
      delogo_btn_add_rect: '+ Ajouter un rectangle',
      delogo_btn_del_rect: '🗑 Supprimer',
      delogo_hint: '💡 Dessinez un rectangle sur le logo ou cliquez sur « Suivi Automatique IA »',
      delogo_btn_apply: 'Appliquer et OK',
      // Notifications & Shutdown
      opt_notify_window: 'Afficher une notification à la fin',
      notify_title: 'Tâche terminée',
      notify_elapsed: 'Temps écoulé :',
      notify_tasks_done: '{count} tâche(s) terminée(s) avec succès',
      btn_open_folder: 'Ouvrir le dossier',
      shutdown_countdown_title: 'Arrêt de l\'ordinateur',
      shutdown_countdown_msg: 'Toutes les tâches sont terminées ! Arrêt de l\'ordinateur dans :',
      btn_cancel_shutdown: 'Annuler l\'arrêt',
      shutdown_cancelled: 'Arrêt annulé avec succès',
      lbl_files: 'fichiers',
      t_d_epub: '→ EPub',
      t_d_mobi: '→ Mobi',
      t_d_azw3: '→ AZW3',
      // Updates Modal
      updates_modal_title: 'Vérifier les mises à jour',
      updates_center_title: 'Centre de mises à jour FormaLux',
      updates_current_ver: 'Version installée : {version}',
      updates_checking_msg: 'Connexion au dépôt GitHub et vérification de la dernière version...',
      updates_up_to_date: 'Vous utilisez la dernière version de FormaLux 👍',
      updates_no_new: 'Aucune mise à jour disponible pour le moment. Votre logiciel est à jour.',
      updates_lbl_checked_at: 'Vérifié à',
      updates_new_found: '🎉 Une nouvelle version est disponible !',
      updates_ver_label: 'Nouvelle version :',
      updates_btn_download: 'Télécharger la mise à jour',
      updates_lbl_notes: 'Notes de version et nouveautés :',
      updates_err_title: 'Impossible de vérifier les mises à jour',
      updates_btn_retry: 'Réessayer',
      updates_btn_view_releases: 'Page des versions sur GitHub',
      // Missing UI & Modal Keys
      btn_close: 'Fermer',
      btn_minimize: 'Réduire',
      btn_maximize: 'Agrandir',
      shutdown_subdesc: 'Pour économiser l\'énergie et terminer automatiquement après les conversions',
      opt_notify_window: 'Afficher une notification contextuelle à la fin',
      opt_github_repo: 'Dépôt GitHub :',
      t_a_extract: 'Extraire l\'audio',
      t_a_tts: 'Synthèse vocale (Texte en audio)',
      btn_start_rename: 'Démarrer le renommage',
      th_resolution: 'Résolution',
      th_bitrate: 'Débit binaire',
      about_dev_publisher: 'Développeur & Éditeur',
      about_os_env: 'Environnement d\'exécution',
      about_media_engine: 'Moteur multimédia',
      about_ha_accel: 'Accélération matérielle',
      about_license_txt: 'Licence : Entièrement gratuit pour tous (Free & Open)',
      updates_err_desc: 'Veuillez vérifier votre connexion Internet.',
      // Options Modal
      grp_output: 'Dossier de sortie',
      btn_change: 'Modifier',
      opt_same_folder: 'Sortie dans le même dossier source',
      opt_sub_folder: 'Créer un sous-dossier nommé FormaLux',
      grp_post: 'Après la conversion',
      opt_shutdown: 'Éteindre l\'ordinateur une fois les tâches terminées',
      opt_open_folder: 'Ouvrir automatiquement le dossier de sortie',
      grp_sound: 'Alertes sonores',
      opt_sound_general: 'Effets sonores de l\'interface',
      opt_sound_complete: 'Sonnerie de fin de conversion avec succès',
      opt_sound_fail: 'Sonnerie d\'avertissement en cas d\'échec',
      grp_system: 'Système & Intégration',
      opt_context_menu: 'Ajouter au menu contextuel de Windows',
      opt_check_updates: 'Vérifier automatiquement les mises à jour',
      opt_minimize_tray: 'Réduire dans la zone de notification',
      grp_gpu: 'Accélération matérielle (GPU)',
      opt_gpu_auto: 'Détecter automatiquement l\'accélération matérielle',
      btn_ha_test: 'Test matériel',
      opt_gpu_desc: 'Prend en charge NVIDIA (NVENC), Intel (QuickSync) et AMD (AMF).',
      grp_cpu: 'Processeur & Multi-threading',
      opt_threads: 'Activer le multi-threading simultané',
      opt_show_usage: 'Afficher l\'utilisation du processeur',
      grp_img_quality: 'Qualité de sortie des images',
      preset_mw2400_mh1800: 'Largeur max 2400 Hauteur max 1800',
      preset_mw1024_mh768: 'Largeur max 1024 Hauteur max 768',
      preset_mw640_mh480: 'Largeur max 640 Hauteur max 480',
      preset_mw320_mh240: 'Largeur max 320 Hauteur max 240',
      preset_mw176_mh144: 'Largeur max 176 Hauteur max 144',
      ps_promo_1: 'Pour plus de fonctions d\'édition d\'images.',
      ps_promo_2: 'Veuillez télécharger "Picosmos Tools"',
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
      btn_add_folder: 'Añadir carpeta',
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
      t_v_separate: 'Separador Audio/Vídeo',
      t_v_frames: 'Exportar Fotogramas',
      t_v_player: 'Reproductor Multimedia',
      t_a_merge: 'Unir Pistas de Audio',
      t_a_split: 'Separar Voz y Música',
      t_a_mix: 'Extraer audio del video',
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
      lbl_ha_supported: 'Compatible',
      btn_retest: 'Volver a probar',
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
      output_format: 'Formato de salida',
      output_setting: 'Ajustes de salida',
      video_setting_title: 'Ajustes de Vídeo',
      audio_setting_title: 'Ajustes de Audio',
      picture_setting_title: 'Ajustes de Imagen',
      btn_save_as: 'Guardar como',
      btn_default: 'Predeterminado',
      ft_tab_files: 'Archivos seleccionados',
      ft_tab_preview: 'Vista previa',
      ft_tab_mediainfo: 'Información de medios',
      th_file_info: 'Información de Medios',
      th_actions: 'Opciones y División',
      th_file_name: 'Nombre de archivo',
      th_size: 'Tamaño',
      th_duration: 'Duración / Resolución',
      th_path: 'Ruta de origen',
      // Category Badges
      badge_video: 'Vídeo',
      badge_audio: 'Audio',
      badge_picture: 'Imagen',
      badge_document: 'Documento',
      badge_disc: 'Disco',
      badge_iso_cso: 'ISO / CSO',
      // Checkbox label template
      lbl_append_setting_name: 'Agregar nombre de ajuste [{name}]',
      // Preset Display Names
      preset_optimum: 'Calidad y tamaño óptimos',
      preset_high_2pass: 'Alta calidad y tamaño (2 pasos)',
      preset_high: 'Alta calidad y tamaño',
      preset_medium: 'Calidad y tamaño medios',
      preset_low: 'Baja calidad y tamaño',
      preset_4k: '4K 2160p',
      preset_2k: '2K 1080p',
      preset_720p: '720p',
      preset_480p: '480p',
      preset_copy: 'Copiar flujo',
      preset_custom: 'Personalizado',
      preset_avc_high: 'AVC Alta calidad 1080p',
      preset_hevc_high: 'HEVC Alta calidad 1080p',
      preset_uhd_4k: '4K Ultra HD',
      preset_qhd_2k: '2K Quad HD',
      preset_audio_high: 'Alta calidad (320 Kbps)',
      preset_audio_medium: 'Calidad media (192 Kbps)',
      preset_audio_low: 'Baja calidad (128 Kbps)',
      preset_audio_vbr_0: 'VBR 0 (Mejor calidad)',
      preset_audio_vbr_high: 'VBR Alta calidad',
      preset_audio_vbr_2: 'VBR 2 (Alta calidad)',
      preset_audio_vbr_medium: 'VBR Calidad media',
      preset_audio_vbr_4: 'VBR 4 (Calidad estándar)',
      preset_audio_vbr_low: 'VBR Baja calidad',
      preset_pic_original: 'Tamaño original',
      preset_pic_50: '50% Tamaño original',
      preset_pic_75: '75% Tamaño original',
      preset_pic_1080: '1920x1080 (Full HD)',
      preset_pic_720: '1280x720 (HD)',
      preset_pic_800: '800x600 (Web)',
      preset_pic_avatar: 'Avatar 1:1 Cuadrado',
      preset_cso_lvl5: 'Nivel de compresión CSO 5',
      preset_ai_delogo: 'Eliminación inteligente de marca de agua',
      badge_ai_delogo: 'Eliminar IA',
      // Tabs
      tab_video: 'Vídeo',
      tab_audio: 'Audio',
      tab_subtitle: 'Subtítulos',
      tab_other: 'Otros',
      tab_watermark: 'Marca de agua',
      // Properties
      prop_size_limit: 'Límite de tamaño',
      prop_video_encode: 'Codificación de vídeo',
      prop_video_size: 'Tamaño de vídeo',
      prop_bitrate: 'Tasa de bits (Kb/s)',
      prop_crf: 'Calidad constante (CRF)',
      prop_gpu: 'Aceleración GPU',
      prop_fps: 'Fotogramas por seg (FPS)',
      prop_aspect_ratio: 'Relación de aspecto',
      prop_encode_2pass: 'Codificación 2 pasos',
      prop_keyframe: 'Fotogramas clave',
      prop_deinterlace: 'Desentrelazado',
      prop_rotate: 'Rotar',
      prop_xmirror: 'Espejo horizontal',
      prop_ymirror: 'Espejo vertical',
      prop_filter: 'Filtro y color',
      prop_fadein: 'Fundido de entrada',
      prop_fadeout: 'Fundido de salida',
      prop_antishake: 'Estabilizador de imagen',
      prop_denoise: 'Reducción de ruido',
      prop_reverse: 'Reproducción inversa',
      prop_audio_encode: 'Codificación de audio',
      prop_sample_rate: 'Frecuencia de muestreo (HZ)',
      prop_audio_bitrate: 'Tasa de bits de audio (Kb/s)',
      prop_channel: 'Canales de audio',
      prop_disable_audio: 'Desactivar audio',
      prop_volume: 'Volumen',
      prop_keep_audio_streams: 'Mantener pistas de audio',
      prop_echo: 'Eco',
      prop_vbr: 'Tasa variable (VBR)',
      prop_sample_format: 'Formato de muestra',
      prop_keep_sub_streams: 'Mantener subtítulos originales',
      prop_add_subtitle: 'Añadir archivo de subtítulo',
      prop_sub_type: 'Tipo de subtítulo',
      prop_sub_fontsize: 'Tamaño de fuente',
      prop_sub_codepage: 'Página de códigos',
      prop_sub_fontfamily: 'Familia de fuente',
      prop_sub_fontcolor: 'Color de fuente',
      prop_sub_borderstyle: 'Estilo de borde',
      prop_sub_outlinesize: 'Grosor de contorno',
      prop_sub_outlinecolor: 'Color de contorno',
      prop_sub_shadowsize: 'Tamaño de sombra',
      prop_sub_scheme: 'Esquema de color',
      prop_metadata: 'Metadatos',
      prop_meta_title: 'Título',
      prop_meta_author: 'Autor / Artista',
      prop_meta_comment: 'Comentario',
      prop_stream_options: 'Opciones de streaming',
      prop_faststart: 'Inicio rápido web',
      prop_2pass_mode: 'Modo 2 pasos',
      prop_wm_enable: 'Activar marca de agua',
      prop_wm_type: 'Tipo de marca de agua',
      prop_wm_image: 'Archivo de imagen',
      prop_wm_text: 'Texto de marca de agua',
      prop_wm_pos: 'Posición',
      prop_wm_opacity: 'Opacidad',
      prop_wm_margin: 'Margen',
      prop_wm_scale: 'Tamaño de escala',
      btn_add: 'Añadir',
      prop_max_width: 'Ancho máx',
      prop_max_height: 'Alto máx',
      ps_lbl_size_limit: 'Límite de tamaño',
      ps_opt_original: 'Tamaño original',
      ps_opt_custom: 'Tamaño personalizado',
      prop_quality: 'Calidad (JPG / WebP)',
      prop_flip: 'Voltear',
      lbl_jpg_quality: 'Calidad JPG:',
      lbl_webp_quality: 'Calidad WebP:',
      // Divide Modal
      div_title: 'Dividir',
      div_off: 'Desactivado',
      div_by_time: 'Por duración de tiempo',
      div_by_count: 'Por cantidad de archivos',
      div_by_size: 'Por tamaño de archivos',
      // Clip Modal
      clip_title: 'Recorte / Opciones',
      clip_start_time: 'Hora de inicio',
      clip_end_time: 'Hora de fin',
      clip_duration: 'Duración:',
      clip_precision: 'Precisión:',
      clip_speed: 'Velocidad:',
      // Multi-Profiles Modal
      mp_title: 'Perfiles múltiples',
      mp_select_all: 'Seleccionar todo',
      // Context Menus
      ctx_clip: 'Recorte / Opciones',
      ctx_divide: 'Dividir',
      ctx_preview: 'Vista previa',
      ctx_remove: 'Eliminar',
      ctx_start: 'Iniciar',
      ctx_stop: 'Detener',
      ctx_open_folder: 'Abrir carpeta',
      ctx_clear_all: 'Vaciar todo',
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
      // Video Joiner & Mux
      vmux_title: 'Unir Vídeo & Mux',
      vmux_out_format: 'Formato de salida:',
      vmux_preset_optimum: 'Calidad y tamaño óptimos',
      vmux_tab_video: 'Vídeo',
      vmux_tab_audio: 'Audio',
      vmux_col_preview: 'Vista previa',
      vmux_col_info: 'Información multimedia',
      vmux_btn_add_video: 'Añadir vídeo',
      vmux_btn_add_audio: 'Añadir audio',
      vmux_btn_add_files: 'Añadir archivos',
      vmux_btn_add_pic: 'Añadir imagen',
      vmux_btn_add_music: 'Añadir desde biblioteca',
      vmux_vol_video: 'Volumen del vídeo',
      vmux_vol_audio: 'Volumen del audio',
      vmux_opt_loop: 'Bucle:',
      vmux_opt_loop_yes: 'Bucle: Sí',
      vmux_opt_loop_no: 'Bucle: No',
      vmux_opt_intervals: 'Intervalos:',
      vmux_btn_clip: 'Cortar',
      vmux_btn_pic: 'Añadir imagen',
      vmux_btn_add_music: 'Añadir música',
      vmux_btn_mute_tip: 'Silenciar / Activar sonido',
      vmux_tip_ok: 'Confirmar y Aceptar',
      vmux_tip_close: 'Cerrar',
      vmux_tip_add_video: 'Añadir archivos de vídeo',
      vmux_tip_add_pic: 'Añadir imágenes',
      vmux_tip_add_audio: 'Añadir archivos de audio',
      vmux_tip_slider: 'Arrastrar para ajustar el volumen (0% a 100%)',
      vmux_tip_setting: 'Ajustes de salida avanzados',
      vmux_tip_tab_video: 'Sección de Vídeo e Imágenes',
      vmux_tip_tab_audio: 'Sección de Audio y Música',
      vmux_alert_add_video_first: 'Por favor, añade primero un archivo de vídeo',
      vmux_alert_add_audio_first: 'Por favor, añade primero un archivo de audio',
      // Audio Mix
      amix_title: 'Mezclador de Audio',
      amix_out_format: 'Formato de salida:',
      amix_preset_high: 'Alta calidad (320 kbps)',
      amix_col_preview: 'Vista previa',
      amix_col_info: 'Información multimedia',
      amix_duration: 'Duración:',
      amix_dur_longest: 'El más largo',
      amix_dur_shortest: 'El más corto',
      amix_dur_first: 'El primero',
      amix_duration_tip: 'Establecer la duración de la mezcla: pista más larga, más corta o primera pista',
      amix_drag_hint: 'Arrastra archivos de audio aquí o haz clic para añadir',
      amix_tip_format: 'Selecciona el formato de audio de salida',
      amix_tip_add_files: 'Añadir archivos de audio a la mezcla',
      amix_tip_clear: 'Vaciar toda la lista de archivos',
      amix_tip_ok: 'Confirmar y Aceptar',
      amix_tip_close: 'Cerrar',
      amix_tip_setting: 'Ajustes de salida avanzados',
      amix_warn_min_files: 'Por favor añade al menos 2 archivos de audio para mezclar',
      // Audio Joiner
      ajoin_title: 'Unir Audio (Audio Joiner)',
      ajoin_out_format: 'Formato de salida:',
      ajoin_preset_high: 'Alta calidad (320 kbps)',
      ajoin_intervals: 'Intervalos:',
      ajoin_intervals_unit: 's',
      ajoin_intervals_tip: 'Intervalo de silencio en segundos entre las dos pistas',
      ajoin_drag_hint: 'Arrastra los dos archivos de audio aquí o haz clic para añadir (solo 2 archivos)',
      ajoin_tip_format: 'Selecciona el formato de audio de salida',
      ajoin_tip_add_files: 'Añadir dos archivos de audio para unir',
      ajoin_tip_clear: 'Vaciar archivos',
      ajoin_tip_ok: 'Confirmar y Unir',
      ajoin_tip_close: 'Cerrar',
      ajoin_tip_setting: 'Ajustes de salida avanzados',
      ajoin_warn_exact_two: 'Audio Joiner requiere exactamente 2 archivos de audio (primera y segunda pista)',
      ajoin_warn_max_two: 'Solo se tomaron los primeros 2 archivos; Audio Joiner une solo 2 archivos',
      ajoin_tip_swap: 'Cambiar el orden de las pistas',
      tip_delete: 'Eliminar',
      tip_move_up: 'Mover arriba',
      tip_move_down: 'Mover abajo',
      tip_change_dir: 'Cambiar carpeta de salida',
      btn_default: 'Predeterminado',
      // Screen Recorder
      sr_title: 'Grabador de pantalla',
      sr_shortcuts: 'Cámara(F5) Grabar(F6) Pausar(F7) Detener(F8)',
      sr_btn_camera: 'Cámara (F5)',
      sr_btn_record: 'Grabar (F6)',
      sr_btn_pause: 'Pausa (F7)',
      sr_btn_stop: 'Detener (F8)',
      sr_region_full: 'Pantalla completa',
      sr_region_window: 'Ventana seleccionada',
      sr_region_custom: 'Área personalizada',
      sr_menu_region: 'Región de pantalla',
      sr_menu_window: 'Ventana',
      sr_menu_fullscreen: 'Pantalla completa',
      sr_btn_output: 'Carpeta de salida',
      sr_chk_mic: 'Usar micrófono',
      sr_chk_sound: 'Capturar sonido del sistema',
      sropt_title: 'Opciones',
      sropt_tab_system: 'Sistema',
      sropt_tab_video: 'Vídeo',
      sropt_tab_audio: 'Audio',
      sropt_cam_hotkey: 'Tecla de cámara',
      sropt_rec_hotkey: 'Tecla de grabación',
      sropt_pause_hotkey: 'Tecla de pausa',
      sropt_stop_hotkey: 'Tecla de detención',
      sropt_out_format: 'Formato de salida',
      sropt_out_folder: 'Carpeta de salida',
      sropt_btn_change: 'Cambiar',
      sropt_btn_open: 'Abrir',
      sropt_open_after: 'Al finalizar, abrir la carpeta',
      sropt_always_on_top: 'Ventana siempre visible',
      sropt_framerate: 'Tasa de fotogramas',
      sropt_bitrate: 'Tasa de bits',
      sropt_draw_mouse: 'Mostrar puntero del ratón',
      sropt_use_sound: 'Capturar sonido del sistema',
      sropt_use_mic: 'Usar micrófono',
      sropt_btn_default: 'Predeterminado',
      sr_lbl_output: 'Carpeta de salida:',
      sr_alert_started: '¡Grabación de pantalla iniciada (F6)!',
      sr_alert_paused: 'Grabación pausada (F7)',
      sr_alert_stopped: 'Grabación finalizada y guardada en la carpeta de salida (F8)',
      sr_alert_screenshot: 'Captura de pantalla (F5) realizada con éxito',
      // Video Downloader
      vdown_title: 'Descargador de vídeos',
      vdown_lbl_url: 'URL del vídeo',
      vdown_placeholder_url: 'Pega la URL de YouTube, Facebook, TikTok o cualquier enlace directo de vídeo aquí...',
      vdown_btn_paste: '📋 Pegar URL',
      vdown_btn_list_formats: '≡ Listar formatos disponibles',
      vdown_hint_cookies: '➔ youtube necesita exportar archivos de cookies',
      vdown_tab_main: '⚙ Principal',
      vdown_tab_network: '🌐 Red',
      vdown_tab_output: '🔀 Salida',
      vdown_th_property: 'Propiedad',
      vdown_th_value: 'Valor',
      vdown_prop_format: '🛡 ID de formato',
      vdown_prop_sub: '💬 Subtítulo',
      vdown_prop_thumb: '🖼 Miniatura',
      vdown_prop_desc: '📝 Descripción',
      vdown_prop_json: 'JSON Info Json',
      vdown_prop_playlist: 'JSON Descargar lista de reproducción',
      vdown_auth_section: '👤 Autenticación',
      vdown_auth_cookies_file: '🍪 Archivo de Cookies',
      vdown_auth_browser_cookies: '🍪 Cookies del navegador',
      vdown_auth_user: 'Nombre de usuario',
      vdown_auth_pass: 'Contraseña',
      vdown_lbl_proxy: 'Dirección del servidor proxy:',
      vdown_lbl_out_dir: 'Carpeta de salida:',
      vdown_btn_default: '🖨 Por defecto',
      vdown_btn_download: '⬇ Descargar',
      vdown_alert_enter_url: 'Por favor, introduce una URL de vídeo para descargar',
      vdown_alert_formats_fetched: 'Formatos disponibles obtenidos con éxito para la URL',
      // Delogo Interactive Editor
      delogo_title: 'Eliminar Marca de Agua — Editor y Seguimiento Interactivo',
      delogo_lbl_rects: 'Lista de rectángulos e intervalos de tiempo:',
      delogo_btn_ai: '✨ Seguimiento Automático por IA',
      delogo_btn_add_rect: '+ Añadir rectángulo',
      delogo_btn_del_rect: '🗑 Eliminar',
      delogo_hint: '💡 Dibuja un rectángulo con el ratón sobre el logo o haz clic en "Seguimiento Automático por IA"',
      delogo_btn_apply: 'Aplicar y Aceptar',
      // Notifications & Shutdown
      opt_notify_window: 'Mostrar ventana de notificación al finalizar',
      notify_title: 'Tarea completada',
      notify_elapsed: 'Tiempo transcurrido:',
      notify_tasks_done: '{count} tarea(s) completada(s) con éxito',
      btn_open_folder: 'Abrir carpeta de salida',
      shutdown_countdown_title: 'Apagando el equipo',
      shutdown_countdown_msg: '¡Todas las tareas completadas! El equipo se apagará en:',
      btn_cancel_shutdown: 'Cancelar apagado',
      shutdown_cancelled: 'Apagado cancelado con éxito',
      lbl_files: 'archivos',
      t_d_epub: '→ EPub',
      t_d_mobi: '→ Mobi',
      t_d_azw3: '→ AZW3',
      // Updates Modal
      updates_modal_title: 'Buscar actualizaciones',
      updates_center_title: 'Centro de actualizaciones FormaLux',
      updates_current_ver: 'Versión instalada: {version}',
      updates_checking_msg: 'Conectando al repositorio de GitHub y verificando...',
      updates_up_to_date: 'Estás usando la versión más reciente de FormaLux 👍',
      updates_no_new: 'No hay actualizaciones disponibles en este momento. Tu aplicación está al día.',
      updates_lbl_checked_at: 'Hora de verificación',
      updates_new_found: '🎉 ¡Una nueva versión está disponible para descargar!',
      updates_ver_label: 'Nueva versión:',
      updates_btn_download: 'Descargar actualización ahora',
      updates_lbl_notes: 'Notas de la versión y novedades:',
      updates_err_title: 'No se pudieron verificar las actualizaciones',
      updates_btn_retry: 'Reintentar',
      updates_btn_view_releases: 'Página de versiones en GitHub',
      // Missing UI & Modal Keys
      btn_close: 'Cerrar',
      btn_minimize: 'Minimizar',
      btn_maximize: 'Maximizar',
      shutdown_subdesc: 'Para ahorrar energía y finalizar automáticamente después de las conversiones',
      opt_notify_window: 'Mostrar ventana de notificación al completar',
      opt_github_repo: 'Repositorio GitHub:',
      t_a_extract: 'Extraer audio',
      t_a_tts: 'Texto a voz',
      btn_start_rename: 'Iniciar cambio de nombre',
      th_resolution: 'Resolución',
      th_bitrate: 'Tasa de bits',
      about_dev_publisher: 'Desarrollador y editor',
      about_os_env: 'Entorno de ejecución',
      about_media_engine: 'Motor multimedia',
      about_ha_accel: 'Aceleración por hardware',
      about_license_txt: 'Licencia: Completamente gratis para todos (Free & Open)',
      updates_err_desc: 'Por favor, comprueba tu conexión a Internet.',
      // Options Modal
      grp_output: 'Carpeta de salida',
      btn_change: 'Cambiar',
      opt_same_folder: 'Salida a la misma carpeta de origen',
      opt_sub_folder: 'Crear subcarpeta llamada FormaLux',
      grp_post: 'Después de la conversión',
      opt_shutdown: 'Apagar el equipo al finalizar todas las tareas',
      opt_open_folder: 'Abrir automáticamente la carpeta de salida',
      grp_sound: 'Alertas de sonido',
      opt_sound_general: 'Efectos de sonido de la interfaz',
      opt_sound_complete: 'Alerta sonora al completar con éxito',
      opt_sound_fail: 'Alerta sonora si falla la conversión',
      grp_system: 'Sistema e integración',
      opt_context_menu: 'Agregar al menú contextual de Windows',
      opt_check_updates: 'Buscar actualizaciones automáticamente',
      opt_minimize_tray: 'Minimizar a la bandeja del sistema',
      grp_gpu: 'Aceleración por hardware (GPU)',
      opt_gpu_auto: 'Detectar aceleración por hardware automáticamente',
      btn_ha_test: 'Prueba de GPU',
      opt_gpu_desc: 'Compatible con NVIDIA (NVENC), Intel (QuickSync) y AMD (AMF).',
      grp_cpu: 'CPU y multiproceso',
      opt_threads: 'Habilitar multiproceso simultáneo',
      opt_show_usage: 'Mostrar uso de CPU en la barra de estado',
      grp_img_quality: 'Calidad de salida de imágenes',
      preset_mw2400_mh1800: 'Ancho máx 2400 Alto máx 1800',
      preset_mw1024_mh768: 'Ancho máx 1024 Alto máx 768',
      preset_mw640_mh480: 'Ancho máx 640 Alto máx 480',
      preset_mw320_mh240: 'Ancho máx 320 Alto máx 240',
      preset_mw176_mh144: 'Ancho máx 176 Alto máx 144',
      ps_promo_1: 'Para más funciones de edición de imágenes.',
      ps_promo_2: 'Por favor descargue "Picosmos Tools"',
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
      btn_add_folder: 'Klasör Ekle',
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
      t_v_separate: 'Ses/Video Ayırıcı',
      t_v_frames: 'Kareleri Dışa Aktar',
      t_v_player: 'Medya Oynatıcı',
      t_a_merge: 'Ses Birleştirici',
      t_a_split: 'Ses ve Müziği Ayır',
      t_a_mix: 'Videodan Ses Çıkar',
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
      t_ha_test_title: 'Donanım Hızlandırma Testi',
      ha_probing: 'Donanım hızlandırma test ediliyor...',
      lbl_ha_supported: 'Destekleniyor',
      btn_retest: 'Yeniden Test Et',
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
      output_format: 'Çıktı Formatı',
      output_setting: 'Çıktı Ayarları',
      video_setting_title: 'Video Ayarları',
      audio_setting_title: 'Ses Ayarları',
      picture_setting_title: 'Resim Ayarları',
      btn_save_as: 'Farklı Kaydet',
      btn_default: 'Varsayılan',
      ft_tab_files: 'Seçilen Dosyalar',
      ft_tab_preview: 'Önizleme',
      ft_tab_mediainfo: 'Medya Bilgisi',
      th_file_info: 'Dosya ve Medya Bilgisi',
      th_actions: 'Seçenekler ve Bölme',
      th_file_name: 'Dosya Adı',
      th_size: 'Boyut',
      th_duration: 'Süre / Çözünürlük',
      th_path: 'Kaynak Yolu',
      // Category Badges
      badge_video: 'Video',
      badge_audio: 'Ses',
      badge_picture: 'Resim',
      badge_document: 'Belge',
      badge_disc: 'Disk',
      badge_iso_cso: 'ISO / CSO',
      // Checkbox label template
      lbl_append_setting_name: 'Ayar adını ekle [{name}]',
      // Preset Display Names
      preset_optimum: 'En uygun kalite ve boyut',
      preset_high_2pass: 'Yüksek kalite ve boyut (2 Geçişli)',
      preset_high: 'Yüksek kalite ve boyut',
      preset_medium: 'Orta kalite ve boyut',
      preset_low: 'Düşük kalite ve boyut',
      preset_4k: '4K 2160p',
      preset_2k: '2K 1080p',
      preset_720p: '720p',
      preset_480p: '480p',
      preset_copy: 'Akışı Kopyala',
      preset_custom: 'Özel',
      preset_avc_high: 'AVC Yüksek kalite 1080p',
      preset_hevc_high: 'HEVC Yüksek kalite 1080p',
      preset_uhd_4k: '4K Ultra HD',
      preset_qhd_2k: '2K Quad HD',
      preset_audio_high: 'Yüksek kalite (320 Kbps)',
      preset_audio_medium: 'Orta kalite (192 Kbps)',
      preset_audio_low: 'Düşük kalite (128 Kbps)',
      preset_audio_vbr_0: 'VBR 0 (En iyi kalite)',
      preset_audio_vbr_high: 'VBR Yüksek kalite',
      preset_audio_vbr_2: 'VBR 2 (Yüksek kalite)',
      preset_audio_vbr_medium: 'VBR Orta kalite',
      preset_audio_vbr_4: 'VBR 4 (Standart kalite)',
      preset_audio_vbr_low: 'VBR Düşük kalite',
      preset_pic_original: 'Orijinal Boyut',
      preset_pic_50: '%50 Orijinal Boyut',
      preset_pic_75: '%75 Orijinal Boyut',
      preset_pic_1080: '1920x1080 (Full HD)',
      preset_pic_720: '1280x720 (HD)',
      preset_pic_800: '800x600 (Web)',
      preset_pic_avatar: 'Avatar 1:1 Kare',
      preset_cso_lvl5: 'CSO Sıkıştırma Düzeyi 5',
      preset_ai_delogo: 'Akıllı Filigran Kaldırma',
      badge_ai_delogo: 'Akıllı Silme',
      // Tabs
      tab_video: 'Video',
      tab_audio: 'Ses',
      tab_subtitle: 'Altyazı',
      tab_other: 'Diğer',
      tab_watermark: 'Filigran',
      // Properties
      prop_size_limit: 'Boyut Sınırı',
      prop_video_encode: 'Video Kodlama',
      prop_video_size: 'Video Boyutu',
      prop_bitrate: 'Bit Hızı (Kb/s)',
      prop_crf: 'Sabit Kalite (CRF)',
      prop_gpu: 'GPU Hızlandırma',
      prop_fps: 'Kare Hızı (FPS)',
      prop_aspect_ratio: 'En-Boy Oranı',
      prop_encode_2pass: '2 Geçişli Kodlama',
      prop_keyframe: 'Anahtar Kare Aralığı',
      prop_deinterlace: 'Taramayı Kaldır',
      prop_rotate: 'Döndür',
      prop_xmirror: 'Yatay Aynalama',
      prop_ymirror: 'Dikey Aynalama',
      prop_filter: 'Filtre ve Renk',
      prop_fadein: 'Girişte Belirme',
      prop_fadeout: 'Çıkışta Kaybolma',
      prop_antishake: 'Titreşim Önleyici',
      prop_denoise: 'Parazit Azaltma',
      prop_reverse: 'Tersine Çevir',
      prop_audio_encode: 'Ses Kodlama',
      prop_sample_rate: 'Örnekleme Hızı (HZ)',
      prop_audio_bitrate: 'Ses Bit Hızı (Kb/s)',
      prop_channel: 'Ses Kanalları',
      prop_disable_audio: 'Sesi Devre Dışı Bırak',
      prop_volume: 'Ses Düzeyi',
      prop_keep_audio_streams: 'Tüm Ses Akışlarını Koru',
      prop_echo: 'Yankı',
      prop_vbr: 'Değişken Bit Hızı (VBR)',
      prop_sample_format: 'Örnekleme Formatı',
      prop_keep_sub_streams: 'Altyazı Akışlarını Koru',
      prop_add_subtitle: 'Harici Altyazı Ekle',
      prop_sub_type: 'Altyazı Türü',
      prop_sub_fontsize: 'Yazı Boyutu',
      prop_sub_codepage: 'Kod Sayfası',
      prop_sub_fontfamily: 'Yazı Tipi',
      prop_sub_fontcolor: 'Yazı Rengi',
      prop_sub_borderstyle: 'Kenarlık Stili',
      prop_sub_outlinesize: 'Dış Çizgi Kalınlığı',
      prop_sub_outlinecolor: 'Dış Çizgi Rengi',
      prop_sub_shadowsize: 'Gölge Boyutu',
      prop_sub_scheme: 'Renk Şeması',
      prop_metadata: 'Meta Verileri',
      prop_meta_title: 'Başlık',
      prop_meta_author: 'Yazar / Sanatçı',
      prop_meta_comment: 'Yorum',
      prop_stream_options: 'Akış Seçenekleri',
      prop_faststart: 'Web Hızlı Başlatma',
      prop_2pass_mode: '2 Geçişli Mod',
      prop_wm_enable: 'Filigranı Etkinleştir',
      prop_wm_type: 'Filigran Türü',
      prop_wm_image: 'Resim Dosyası',
      prop_wm_text: 'Filigran Metni',
      prop_wm_pos: 'Konum',
      prop_wm_opacity: 'Opaklık',
      prop_wm_margin: 'Kenar Boşluğu',
      prop_wm_scale: 'Ölçek Boyutu',
      btn_add: 'Ekle',
      prop_max_width: 'Maks. Genişlik',
      prop_max_height: 'Maks. Yükseklik',
      ps_lbl_size_limit: 'Boyut Sınırı',
      ps_opt_original: 'Orijinal Boyut',
      ps_opt_custom: 'Özel Boyut',
      prop_quality: 'Kalite (JPG / WebP)',
      prop_flip: 'Çevir',
      lbl_jpg_quality: 'JPG Kalitesi:',
      lbl_webp_quality: 'WebP Kalitesi:',
      // Divide Modal
      div_title: 'Dosyayı Böl',
      div_off: 'Kapalı',
      div_by_time: 'Süreye göre',
      div_by_count: 'Dosya sayısına göre',
      div_by_size: 'Dosya boyutuna göre',
      clip_title: 'Kırpma / Seçenekler',
      clip_start_time: 'Başlangıç Zamanı',
      clip_end_time: 'Bitiş Zamanı',
      clip_duration: 'Süre:',
      clip_precision: 'Hassasiyet:',
      clip_speed: 'Hız:',
      // Multi-Profiles Modal
      mp_title: 'Çoklu Profiller',
      mp_select_all: 'Tümünü Seç',
      // Context Menus
      ctx_clip: 'Kırpma / Seçenekler',
      ctx_divide: 'Böl',
      ctx_preview: 'Önizleme',
      ctx_remove: 'Kaldır',
      ctx_start: 'Başlat',
      ctx_stop: 'Durdur',
      ctx_open_folder: 'Çıktı Klasörünü Aç',
      ctx_clear_all: 'Tümünü Temizle',
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
      // Video Joiner & Mux
      vmux_title: 'Video Birleştirici & Mux',
      vmux_out_format: 'Çıktı Formatı:',
      vmux_preset_optimum: 'En uygun kalite ve boyut',
      vmux_tab_video: 'Video',
      vmux_tab_audio: 'Ses',
      vmux_col_preview: 'Önizleme',
      vmux_col_info: 'Medya Bilgisi',
      vmux_btn_add_video: 'Video Ekle',
      vmux_btn_add_audio: 'Ses Ekle',
      vmux_btn_add_files: 'Dosya Ekle',
      vmux_btn_add_pic: 'Resim Ekle',
      vmux_btn_add_music: 'Müzik kitaplığından ekle',
      vmux_vol_video: 'Video ses düzeyi',
      vmux_vol_audio: 'Ses düzeyi',
      vmux_opt_loop: 'Döngü:',
      vmux_opt_loop_yes: 'Döngü: Evet',
      vmux_opt_loop_no: 'Döngü: Hayır',
      vmux_opt_intervals: 'Aralıklar:',
      vmux_btn_clip: 'Kırp',
      vmux_btn_pic: 'Resim Ekle',
      vmux_btn_add_music: 'Müzik Ekle',
      vmux_btn_mute_tip: 'Sesi Kapat / Aç',
      vmux_tip_ok: 'Onayla ve Tamam',
      vmux_tip_close: 'Kapat',
      vmux_tip_add_video: 'Video Dosyaları Ekle',
      vmux_tip_add_pic: 'Resim Dosyaları Ekle',
      vmux_tip_add_audio: 'Ses Dosyaları Ekle',
      vmux_tip_slider: 'Ses düzeyini ayarlamak için kaydırın (%0 - %100)',
      vmux_tip_setting: 'Gelişmiş Çıktı Ayarları',
      vmux_tip_tab_video: 'Video ve Resim Bölümü',
      vmux_tip_tab_audio: 'Ses ve Müzik Bölümü',
      vmux_alert_add_video_first: 'Lütfen önce bir video dosyası ekleyin',
      vmux_alert_add_audio_first: 'Lütfen önce bir ses dosyası ekleyin',
      // Audio Mix
      amix_title: 'Ses Karıştırıcı',
      amix_out_format: 'Çıktı Formatı:',
      amix_preset_high: 'Yüksek kalite (320 kbps)',
      amix_col_preview: 'Önizleme',
      amix_col_info: 'Medya Bilgisi',
      amix_duration: 'Süre:',
      amix_dur_longest: 'En uzun',
      amix_dur_shortest: 'En kısa',
      amix_dur_first: 'İlk dosya',
      amix_duration_tip: 'Karışım süresini belirleyin: en uzun parça, en kısa parça veya ilk parça',
      amix_drag_hint: 'Ses dosyalarını buraya sürükleyin veya eklemek için tıklayın',
      amix_tip_format: 'Çıktı ses formatını seçin',
      amix_tip_add_files: 'Karışıma ses dosyaları ekle',
      amix_tip_clear: 'Tüm dosya listesini temizle',
      amix_tip_ok: 'Onayla ve Tamam',
      amix_tip_close: 'Kapat',
      amix_tip_setting: 'Gelişmiş Çıktı Ayarları',
      amix_warn_min_files: 'Birlikte karıştırmak için lütfen en az 2 ses dosyası ekleyin',
      // Audio Joiner
      ajoin_title: 'Ses Birleştirici',
      ajoin_out_format: 'Çıktı Formatı:',
      ajoin_preset_high: 'Yüksek kalite (320 kbps)',
      ajoin_intervals: 'Aralıklar:',
      ajoin_intervals_unit: 'sn',
      ajoin_intervals_tip: 'İki ses parçası arasındaki saniye cinsinden sessizlik süresi',
      ajoin_drag_hint: 'İki ses dosyasını buraya sürükleyin veya eklemek için tıklayın (yalnızca 2 dosya)',
      ajoin_tip_format: 'Çıktı ses formatını seçin',
      ajoin_tip_add_files: 'Birleştirmek için iki ses dosyası ekleyin',
      ajoin_tip_clear: 'Dosyaları temizle',
      ajoin_tip_ok: 'Onayla ve Birleştir',
      ajoin_tip_close: 'Kapat',
      ajoin_tip_setting: 'Gelişmiş Çıktı Ayarları',
      ajoin_warn_exact_two: 'Ses Birleştirici tam olarak 2 ses dosyası gerektirir (İlk ve İkinci parça)',
      ajoin_warn_max_two: 'Yalnızca ilk 2 dosya eklendi; Ses Birleştirici yalnızca 2 ses dosyasını birleştirir',
      ajoin_tip_swap: 'Parçaların sırasını değiştir',
      tip_delete: 'Sil',
      tip_move_up: 'Yukarı taşı',
      tip_move_down: 'Aşağı taşı',
      tip_change_dir: 'Çıktı klasörünü değiştir',
      btn_default: 'Varsayılan',
      // Screen Recorder
      sr_title: 'Ekran Kaydedici',
      sr_shortcuts: 'Kamera(F5) Kaydet(F6) Duraklat(F7) Durdur(F8)',
      sr_btn_camera: 'Kamera (F5)',
      sr_btn_record: 'Kaydet (F6)',
      sr_btn_pause: 'Duraklat (F7)',
      sr_btn_stop: 'Durdur (F8)',
      sr_region_full: 'Tam Ekran',
      sr_region_window: 'Seçili Pencere',
      sr_region_custom: 'Özel Bölge',
      sr_menu_region: 'Ekran bölgesi',
      sr_menu_window: 'Pencere',
      sr_menu_fullscreen: 'Tam ekran',
      sr_btn_output: 'Çıktı klasörü',
      sr_chk_mic: 'Mikrofon kullan',
      sr_chk_sound: 'Yakalama sesini kullan',
      sropt_title: 'Seçenekler',
      sropt_tab_system: 'Sistem',
      sropt_tab_video: 'Video',
      sropt_tab_audio: 'Ses',
      sropt_cam_hotkey: 'Kamera kısayolu',
      sropt_rec_hotkey: 'Kayıt kısayolu',
      sropt_pause_hotkey: 'Duraklatma kısayolu',
      sropt_stop_hotkey: 'Durdurma kısayolu',
      sropt_out_format: 'Çıktı formatı',
      sropt_out_folder: 'Çıktı klasörü',
      sropt_btn_change: 'Değiştir',
      sropt_btn_open: 'Aç',
      sropt_open_after: 'Bittiğinde klasörü aç',
      sropt_always_on_top: 'Pencere her zaman üstte',
      sropt_framerate: 'Kare hızı',
      sropt_bitrate: 'Bit hızı',
      sropt_draw_mouse: 'Fare imlecini çiz',
      sropt_use_sound: 'Yakalama sesini kullan',
      sropt_use_mic: 'Mikrofon kullan',
      sropt_btn_default: 'Varsayılan',
      sr_lbl_output: 'Çıktı Klasörü:',
      sr_alert_started: 'Ekran kaydı başladı (F6)!',
      sr_alert_paused: 'Kayıt duraklatıldı (F7)',
      sr_alert_stopped: 'Kayıt tamamlandı ve çıktı klasörüne kaydedildi (F8)',
      sr_alert_screenshot: 'Ekran görüntüsü (F5) başarıyla yakalandı',
      // Video Downloader
      vdown_title: 'Video İndirici',
      vdown_lbl_url: 'Video Bağlantısı',
      vdown_placeholder_url: 'YouTube, Facebook, TikTok veya doğrudan video bağlantısını buraya yapıştırın...',
      vdown_btn_paste: '📋 Bağlantıyı Yapıştır',
      vdown_btn_list_formats: '≡ Mevcut Formatları Listele',
      vdown_hint_cookies: '➔ youtube çerez (cookies) dosyalarının dışa aktarılmasını gerektirir',
      vdown_tab_main: '⚙ Temel',
      vdown_tab_network: '🌐 Ağ',
      vdown_tab_output: '🔀 Çıktı',
      vdown_th_property: 'Özellik',
      vdown_th_value: 'Değer',
      vdown_prop_format: '🛡 Format Kimliği',
      vdown_prop_sub: '💬 Altyazı',
      vdown_prop_thumb: '🖼 Küçük Resim',
      vdown_prop_desc: '📝 Açıklama',
      vdown_prop_json: 'JSON Bilgi Dosyası',
      vdown_prop_playlist: 'JSON Oynatma Listesini İndir',
      vdown_auth_section: '👤 Kimlik Doğrulama',
      vdown_auth_cookies_file: '🍪 Cookies Dosyası',
      vdown_auth_browser_cookies: '🍪 Tarayıcıdan Cookies',
      vdown_auth_user: 'Kullanıcı Adı',
      vdown_auth_pass: 'Şifre',
      vdown_lbl_proxy: 'Proxy Sunucu Adresi:',
      vdown_lbl_out_dir: 'Çıktı Klasörü:',
      vdown_btn_default: '🖨 Varsayılan',
      vdown_btn_download: '⬇ İndir',
      vdown_alert_enter_url: 'Lütfen indirmek için bir video bağlantısı girin',
      vdown_alert_formats_fetched: 'Mevcut formatlar belirtilen bağlantı için başarıyla alındı',
      // Delogo Interactive Editor
      delogo_title: 'Filigranı Kaldır — Etkileşimli Düzenleyici ve Otomatik Takip',
      delogo_lbl_rects: 'Seçili dikdörtgenler ve zaman aralıkları:',
      delogo_btn_ai: '✨ Yapay Zeka Otomatik Takip',
      delogo_btn_add_rect: '+ Dikdörtgen Ekle',
      delogo_btn_del_rect: '🗑 Sil',
      delogo_hint: '💡 Fare ile logonun üzerine bir dikdörtgen çizin veya "Yapay Zeka Otomatik Takip"e tıklayın',
      delogo_btn_apply: 'Uygula ve Tamam',
      // Notifications & Shutdown
      opt_notify_window: 'Tamamlandığında bildirim penceresi göster',
      notify_title: 'Görev Tamamlandı',
      notify_elapsed: 'Geçen Süre:',
      notify_tasks_done: '{count} görev başarıyla tamamlandı',
      btn_open_folder: 'Çıktı Klasörünü Aç',
      shutdown_countdown_title: 'Bilgisayar Kapatılıyor',
      shutdown_countdown_msg: 'Tüm görevler tamamlandı! Bilgisayar kapanıyor:',
      btn_cancel_shutdown: 'Kapatmayı İptal Et',
      shutdown_cancelled: 'Kapatma işlemi başarıyla iptal edildi',
      lbl_files: 'dosya',
      t_d_epub: '→ EPub',
      t_d_mobi: '→ Mobi',
      t_d_azw3: '→ AZW3',
      // Updates Modal
      updates_modal_title: 'Güncellemeleri Denetle',
      updates_center_title: 'FormaLux Güncelleme Merkezi',
      updates_current_ver: 'Yüklü geçerli sürüm: {version}',
      updates_checking_msg: 'GitHub deposuna bağlanılıyor ve en son sürüm denetleniyor...',
      updates_up_to_date: 'FormaLux\'un en son sürümünü kullanıyorsunuz 👍',
      updates_no_new: 'Şu anda yeni bir güncelleme yok. Uygulamanız tamamen güncel.',
      updates_lbl_checked_at: 'Denetleme Zamanı',
      updates_new_found: '🎉 İndirmek için yeni bir sürüm mevcut!',
      updates_ver_label: 'Yeni Sürüm:',
      updates_btn_download: 'Güncellemeyi Şimdi İndir',
      updates_lbl_notes: 'Sürüm Notları ve Yenilikler:',
      updates_err_title: 'Güncellemeler Denetlenemedi',
      updates_btn_retry: 'Yeniden Dene',
      updates_btn_view_releases: 'GitHub Sürümler Sayfası',
      // Missing UI & Modal Keys
      btn_close: 'Kapat',
      btn_minimize: 'Küçült',
      btn_maximize: 'Büyüt',
      shutdown_subdesc: 'Enerji tasarrufu sağlamak ve dönüştürmeler bittiğinde sistemi kapatmak için',
      opt_notify_window: 'Tamamlandığında bildirim penceresi göster',
      opt_github_repo: 'GitHub Deposu:',
      t_a_extract: 'Sesi Dışa Aktar',
      t_a_tts: 'Metinden Sese',
      btn_start_rename: 'Yeniden Adlandırmayı Başlat',
      th_resolution: 'Çözünürlük',
      th_bitrate: 'Bit Hızı',
      about_dev_publisher: 'Geliştirici & Yayıncı',
      about_os_env: 'Çalışma Ortamı',
      about_media_engine: 'Medya Motoru',
      about_ha_accel: 'Donanım Hızlandırma',
      about_license_txt: 'Lisans: Herkes İçin Tamamen Ücretsiz (Free & Open)',
      updates_err_desc: 'Lütfen internet bağlantınızı kontrol edin.',
      // Options Modal
      grp_output: 'Çıktı Klasörü',
      btn_change: 'Değiştir',
      opt_same_folder: 'Kaynak dosya ile aynı klasöre kaydet',
      opt_sub_folder: 'FormaLux adında alt klasör oluştur',
      grp_post: 'Dönüştürme Sonrası',
      opt_shutdown: 'Tüm görevler bittiğinde bilgisayarı kapat',
      opt_open_folder: 'Tamamlandığında çıktı klasörünü otomatik aç',
      grp_sound: 'Sesli Uyarılar',
      opt_sound_general: 'Genel arayüz ses efektleri',
      opt_sound_complete: 'İşlem başarıyla bittiğinde ses çal',
      opt_sound_fail: 'Dönüştürme başarısız olduğunda ses çal',
      grp_system: 'Sistem & Entegrasyon',
      opt_context_menu: 'Windows sağ tık menüsüne ekle',
      opt_check_updates: 'Güncellemeleri otomatik denetle',
      opt_minimize_tray: 'Sistem tepsisine (saatin yanına) küçült',
      grp_gpu: 'Donanım Hızlandırma (GPU)',
      opt_gpu_auto: 'GPU hızlandırmasını otomatik algıla',
      btn_ha_test: 'Donanım Testi',
      opt_gpu_desc: 'NVIDIA (NVENC), Intel (QuickSync) ve AMD (AMF) hızlandırmasını destekler.',
      grp_cpu: 'İşlemci & Çoklu İş Parçacığı',
      opt_threads: 'Eşzamanlı çoklu işlemeyi etkinleştir',
      opt_show_usage: 'Durum çubuğunda CPU kullanımını göster',
      grp_img_quality: 'Resim Çıktı Kalitesi',
      preset_mw2400_mh1800: 'Maks Genişlik 2400 Maks Yükseklik 1800',
      preset_mw1024_mh768: 'Maks Genişlik 1024 Maks Yükseklik 768',
      preset_mw640_mh480: 'Maks Genişlik 640 Maks Yükseklik 480',
      preset_mw320_mh240: 'Maks Genişlik 320 Maks Yükseklik 240',
      preset_mw176_mh144: 'Maks Genişlik 176 Maks Yükseklik 144',
      ps_promo_1: 'Daha fazla resim düzenleme işlevi için.',
      ps_promo_2: 'Lütfen "Picosmos Tools" indirin',
    }
  };

  // ========== Tool Definitions (All 56 Tools) ==========
  const TOOL_DEFS = {
    // VIDEO
    v_mp4: { name: '→ MP4', section: 'video', ext: '.mp4', filters: [{ name: 'Video', extensions: ['mp4','mkv','avi','mov','wmv','flv','webm','mpg','3gp','ts','m4v'] }],
      options: [
        { key: 'quality', label: 'الجودة', type: 'select', choices: [['high','عالية'],['medium','متوسطة'],['low','منخفضة']], default: 'medium' },
        { key: 'resolution', label: 'الدقة', type: 'select', choices: [['','الأصلية'],['2160','4K (2160p)'],['1080','Full HD (1080p)'],['720','HD (720p)'],['480','SD (480p)']], default: '' },
        { key: 'fps', label: 'معدل الإطارات', type: 'select', choices: [['','الأصلي'],['60','60 إطار/ث'],['30','30 إطار/ث'],['24','24 إطار/ث']], default: '' },
        { key: 'audioBitrate', label: 'جودة الصوت', type: 'select', choices: [['320','320 ك.بت/ث'],['256','256 ك.بت/ث'],['192','192 ك.بت/ث'],['128','128 ك.بت/ث']], default: '192' },
      ]
    },
    v_mkv: { name: '→ MKV', section: 'video', ext: '.mkv', filters: [{ name: 'Video', extensions: ['mp4','mkv','avi','mov','wmv','flv','webm','mpg','ts'] }],
      options: [
        { key: 'copy', label: 'نسخ فوري بدون إعادة ترميز', type: 'checkbox', default: false },
        { key: 'quality', label: 'الجودة', type: 'select', choices: [['high','عالية'],['medium','متوسطة'],['low','منخفضة']], default: 'medium' },
        { key: 'resolution', label: 'الدقة', type: 'select', choices: [['','الأصلية'],['1080','1080p'],['720','720p']], default: '' },
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
        { key: 'quality', label: 'الجودة', type: 'select', choices: [['high','عالية'],['medium','متوسطة'],['low','منخفضة']], default: 'medium' },
      ]
    },
    v_avi: {
      name: 'AVI',
      defaultExt: '.avi',
      multiFormats: [
        { ext: '.avi', label: 'AVI' },
        { ext: '.flv', label: 'FLV' },
        { ext: '.mov', label: 'MOV' },
        { ext: '.wmv', label: 'WMV' },
        { ext: '.mpg', label: 'MPG' },
        { ext: '.vob', label: 'VOB' },
        { ext: '.3gp', label: '3GP' },
        { ext: '.swf', label: 'SWF' }
      ],
      section: 'video',
      ext: '.avi',
      filters: [{ name: 'Video Files', extensions: ['mp4','mkv','avi','mov','wmv','flv','webm','ts','m4v','mpg','vob','3gp'] }],
      options: []
    },
    v_merge: { name: 'دامج & Mux', section: 'video', ext: '.mp4', multi: true, filters: [{ name: 'Video', extensions: ['mp4','mkv','avi','mov','ts'] }],
      options: [
        { key: 'mode', label: 'نوع العملية', type: 'select', choices: [['concat','دمج مقاطع فيديو بالتتابع'],['compress','ضغط الفيديو']], default: 'concat' },
      ]
    },
    v_separate: { name: 'الفاصل', section: 'video', ext: '.mp4', filters: [{ name: 'Video', extensions: ['mp4','mkv','avi','mov'] }],
      options: [
        { key: 'target', label: 'استخراج', type: 'select', choices: [['video','استخراج فيديو صامت فقط (بدون صوت)'],['audio','استخراج ملف الصوت فقط']], default: 'audio' },
      ]
    },
    v_frames: { name: 'إطارات التصدير', section: 'video', ext: '.jpg', filters: [{ name: 'Video', extensions: ['mp4','mkv','avi','mov'] }],
      options: [
        { key: 'interval', label: 'استخراج صورة كل (ثانية)', type: 'number', default: 1, min: 1, max: 60 },
      ]
    },
    v_player: { name: 'Format Player', section: 'video', ext: '', filters: [{ name: 'Media', extensions: ['*'] }], noQueue: true, options: [] },

    // AUDIO
    a_merge: { name: 'دامج الصوت', section: 'audio', ext: '.mp3', multi: true, filters: [{ name: 'Audio', extensions: ['mp3','wav','flac','m4a','ogg'] }], options: [] },
    a_split: {
      name: 'فصل الصوت عن الموسيقى',
      section: 'audio',
      ext: '.mp3',
      filters: [{ name: 'Audio Files', extensions: ['mp3','wav','flac','m4a','aac','ogg','wma','opus'] }],
      options: []
    },
    a_mix: {
      name: 'فصل الصوت عن الفيديو',
      section: 'audio',
      ext: '.mp3',
      filters: [{ name: 'Video Files', extensions: ['mp4','mkv','avi','mov','webm','flv','wmv','ts','m4v','3gp','rmvb'] }],
      options: []
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
    a_aac: {
      name: 'AC3',
      defaultExt: '.ac3',
      multiFormats: [
        { ext: '.ac3', label: 'AC3' },
        { ext: '.aac', label: 'AAC' },
        { ext: '.dts', label: 'DTS' },
        { ext: '.mmf', label: 'MMF' },
        { ext: '.m4r', label: 'M4R' },
        { ext: '.mp2', label: 'MP2' },
        { ext: '.ogg', label: 'OGG' },
        { ext: '.wv', label: 'WV' }
      ],
      section: 'audio',
      ext: '.ac3',
      filters: [{ name: 'Audio & Video Files', extensions: ['mp3','wav','flac','m4a','aac','ogg','wma','opus','ac3','dts','mp2','m4r','wv','mmf','mp4','mkv','avi','mov','webm','ts','wmv','flv'] }],
      options: []
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
    d_pdf_join: { name: 'PDF Joiner', i18nKey: 't_d_pdf_join', section: 'document', ext: '.pdf', multi: true, filters: [{ name: 'PDF', extensions: ['pdf'] }], options: [] },
    d_pdf_compress: { name: 'ضغط PDF', i18nKey: 't_d_compress', section: 'document', ext: '.pdf', filters: [{ name: 'PDF', extensions: ['pdf'] }], options: [] },
    d_pic_pdf: { name: 'Pic → PDF', i18nKey: 't_d_pic_pdf', section: 'document', ext: '.pdf', multi: true, filters: [{ name: 'Images', extensions: ['jpg','png','webp'] }], options: [] },
    d_pdf_pic: { name: 'PDF → Pic', i18nKey: 't_d_pdf_pic', section: 'document', ext: '.jpg', filters: [{ name: 'PDF', extensions: ['pdf'] }], options: [] },
    d_pdf_text: { name: 'PDF → Text', i18nKey: 't_d_pdf_text', section: 'document', ext: '.txt', filters: [{ name: 'PDF', extensions: ['pdf'] }], options: [] },
    d_pdf_docx: { name: 'PDF → Docx', i18nKey: 't_d_pdf_docx', section: 'document', ext: '.docx', filters: [{ name: 'PDF', extensions: ['pdf'] }], options: [] },
    d_pdf_excel: { name: 'PDF → Excel', i18nKey: 't_d_pdf_excel', section: 'document', ext: '.xlsx', filters: [{ name: 'PDF', extensions: ['pdf'] }], options: [] },
    d_docx_pdf: { name: 'Docx → PDF', i18nKey: 't_d_docx_pdf', section: 'document', ext: '.pdf', filters: [{ name: 'Word', extensions: ['docx','doc'] }], options: [] },
    d_pdf_decrypt: { name: 'فك تشفير PDF', i18nKey: 't_d_decrypt', section: 'document', ext: '.pdf', filters: [{ name: 'PDF', extensions: ['pdf'] }], options: [] },
    d_pdf_encrypt: { name: 'تشفير PDF', i18nKey: 't_d_encrypt', section: 'document', ext: '.pdf', filters: [{ name: 'PDF', extensions: ['pdf'] }], options: [] },
    d_ffzip: { name: 'FFZip (أرشيف)', i18nKey: 't_d_zip', section: 'document', ext: '.zip', multi: true, filters: [{ name: 'All Files', extensions: ['*'] }], options: [] },
    d_epub: { name: '→ EPub', i18nKey: 't_d_epub', section: 'document', ext: '.epub', filters: [{ name: 'Documents', extensions: ['txt','html','md','pdf'] }], options: [] },
    d_mobi: { name: '→ Mobi', i18nKey: 't_d_mobi', section: 'document', ext: '.mobi', filters: [{ name: 'Documents', extensions: ['epub','txt','pdf'] }], options: [] },
    d_azw3: { name: '→ AZW3', i18nKey: 't_d_azw3', section: 'document', ext: '.azw3', filters: [{ name: 'Documents', extensions: ['epub','mobi','pdf'] }], options: [] },

    // DISCS / ISO
    disc_bluray_mkv: { name: 'Bluray → MKV', i18nKey: 't_disc_bluray', section: 'disc', ext: '.mkv', dirInput: true, options: [] },
    disc_dvd_video: { name: 'DVD → Video', i18nKey: 't_disc_dvd', section: 'disc', ext: '.mp4', dirInput: true, options: [] },
    disc_cd_audio: { name: 'CD → Audio', i18nKey: 't_disc_cd', section: 'disc', ext: '.mp3', dirInput: true, options: [] },
    disc_dvd_iso: { name: 'DVD/CD → ISO', i18nKey: 't_disc_iso', section: 'disc', ext: '.iso', dirInput: true, options: [] },
    disc_iso_cso: { name: 'ISO ↔ CSO', i18nKey: 't_disc_cso', section: 'disc', ext: '.cso', filters: [{ name: 'Disc Images', extensions: ['iso','cso'] }], options: [] },

    // UTILITIES
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
    setupNotificationAndShutdownUI();
    updateOutputPathDisplay();

    // Sync status bar checkboxes with settings
    const chkShutdown = document.getElementById('chk-shutdown');
    if (chkShutdown) {
      chkShutdown.checked = !!settings.shutdownAfter;
      chkShutdown.addEventListener('change', () => {
        settings.shutdownAfter = chkShutdown.checked;
        const optShut = document.getElementById('opt-shutdown');
        if (optShut) optShut.checked = chkShutdown.checked;
        window.api.saveSettings(settings);
      });
    }

    const chkNotify = document.getElementById('chk-notify');
    if (chkNotify) {
      chkNotify.checked = settings.notifyComplete !== false;
      chkNotify.addEventListener('change', () => {
        settings.notifyComplete = chkNotify.checked;
        const optNot = document.getElementById('opt-notify-complete');
        if (optNot) optNot.checked = chkNotify.checked;
        window.api.saveSettings(settings);
      });
    }

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

    // Update vmux sliders direction if open
    const vSl = document.getElementById('vmux-video-volume');
    if (vSl) updateVmuxVolumeUI('video', vSl.value);
    const aSl = document.getElementById('vmux-audio-volume');
    if (aSl) updateVmuxVolumeUI('audio', aSl.value);

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

    // Update all elements with data-i18n-title
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.dataset.i18nTitle;
      if (bundle[key]) {
        el.title = bundle[key];
      }
    });

    // Update all elements with data-i18n-placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.dataset.i18nPlaceholder;
      if (bundle[key]) {
        el.placeholder = bundle[key];
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

    if (typeof renderAmixTable === 'function' && typeof amixFiles !== 'undefined' && amixFiles.length > 0) renderAmixTable();
    if (typeof renderAjoinTable === 'function' && typeof ajoinFiles !== 'undefined' && ajoinFiles.length > 0) renderAjoinTable();

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

    // Update updates modal dynamic version label
    const curVerEl = document.getElementById('updates-current-version-label');
    if (curVerEl && bundle.updates_current_ver) {
      curVerEl.textContent = bundle.updates_current_ver.replace('{version}', 'v1.0.0');
    }

    // Update bottom status elapsed label
    if (typeof updateElapsedDisplay === 'function') updateElapsedDisplay();

    // Update format task modal & presets if open or active
    if (typeof updateCategoryBadge === 'function') updateCategoryBadge();
    if (typeof updatePresetDisplays === 'function') updatePresetDisplays();
    if (typeof updatePresetDropdownOptions === 'function') updatePresetDropdownOptions();
    if (typeof updateMultiProfilesModalLanguage === 'function') updateMultiProfilesModalLanguage();
    if (typeof updateSRTitlebarShortcuts === 'function') updateSRTitlebarShortcuts();

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
      const repo = settings.githubRepo || 'mohammadfahmi2030/FormaLux';
      const url = repo.startsWith('http') ? repo : `https://github.com/${repo}`;
      window.api.openExternalUrl(url);
    });
    document.getElementById('menu-action-updates')?.addEventListener('click', (e) => {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      closeAllDropdowns();
      triggerCheckForUpdates(true);
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
    // Ensure all tool card icons load robustly
    document.querySelectorAll('img.tool-img-icon').forEach(img => {
      img.addEventListener('error', function onIconErr() {
        if (this.dataset.fallbackApplied) return;
        this.dataset.fallbackApplied = 'true';
        const alt = this.getAttribute('alt');
        if (alt) {
          this.src = `assets/tools/${alt}.png`;
        }
      });
    });

    document.querySelectorAll('.tool-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        const toolType = card.dataset.tool;
        if (toolType === 'util_ha_test') {
          openHaTestModal();
          return;
        }
        if (toolType === 'v_player') {
          playMediaWithSystem();
          return;
        }
        if (toolType === 'v_merge') {
          openVideoMuxModal();
          return;
        }
        if (toolType === 'a_merge') {
          openAudioJoinModal();
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

  // ========== Tool Modal Options Localization Map ==========
  const OPTION_TRANSLATIONS = {
    quality: {
      label: { ar: 'الجودة', en: 'Quality', fr: 'Qualité', es: 'Calidad', tr: 'Kalite' },
      choices: {
        high: { ar: 'عالية', en: 'High', fr: 'Haute', es: 'Alta', tr: 'Yüksek' },
        medium: { ar: 'متوسطة', en: 'Medium', fr: 'Moyenne', es: 'Media', tr: 'Orta' },
        low: { ar: 'منخفضة', en: 'Low', fr: 'Basse', es: 'Baja', tr: 'Düşük' },
      }
    },
    resolution: {
      label: { ar: 'الدقة', en: 'Resolution', fr: 'Résolution', es: 'Resolución', tr: 'Çözünürlük' },
      choices: {
        '': { ar: 'الأصلية', en: 'Original', fr: 'Originale', es: 'Original', tr: 'Orijinal' },
        '2160': { ar: '4K (2160p)', en: '4K (2160p)', fr: '4K (2160p)', es: '4K (2160p)', tr: '4K (2160p)' },
        '1080': { ar: 'Full HD (1080p)', en: 'Full HD (1080p)', fr: 'Full HD (1080p)', es: 'Full HD (1080p)', tr: 'Full HD (1080p)' },
        '720': { ar: 'HD (720p)', en: 'HD (720p)', fr: 'HD (720p)', es: 'HD (720p)', tr: 'HD (720p)' },
        '480': { ar: 'SD (480p)', en: 'SD (480p)', fr: 'SD (480p)', es: 'SD (480p)', tr: 'SD (480p)' },
      }
    },
    fps: {
      label: { ar: 'معدل الإطارات', en: 'Frame Rate (FPS)', fr: 'Images par seconde (FPS)', es: 'Fotogramas/seg (FPS)', tr: 'Kare Hızı (FPS)' },
      choices: {
        '': { ar: 'الأصلي', en: 'Original', fr: 'Original', es: 'Original', tr: 'Orijinal' },
        '60': { ar: '60 إطار/ث', en: '60 fps', fr: '60 fps', es: '60 fps', tr: '60 fps' },
        '30': { ar: '30 إطار/ث', en: '30 fps', fr: '30 fps', es: '30 fps', tr: '30 fps' },
        '24': { ar: '24 إطار/ث', en: '24 fps', fr: '24 fps', es: '24 fps', tr: '24 fps' },
      }
    },
    audioBitrate: {
      label: { ar: 'جودة الصوت', en: 'Audio Quality', fr: 'Qualité audio', es: 'Calidad de audio', tr: 'Ses Kalitesi' },
      choices: {
        '320': { ar: '320 ك.بت/ث', en: '320 kbps', fr: '320 kbps', es: '320 kbps', tr: '320 kbps' },
        '256': { ar: '256 ك.بت/ث', en: '256 kbps', fr: '256 kbps', es: '256 kbps', tr: '256 kbps' },
        '192': { ar: '192 ك.بت/ث', en: '192 kbps', fr: '192 kbps', es: '192 kbps', tr: '192 kbps' },
        '128': { ar: '128 ك.بت/ث', en: '128 kbps', fr: '128 kbps', es: '128 kbps', tr: '128 kbps' },
      }
    },
    copy: {
      label: {
        ar: 'نسخ فوري بدون إعادة ترميز',
        en: 'Direct stream copy (No re-encoding)',
        fr: 'Copie directe du flux (Sans réencodage)',
        es: 'Copia directa de flujo (Sin recodificar)',
        tr: 'Yeniden kodlamadan doğrudan akış kopyalama'
      }
    },
    mode: {
      label: { ar: 'نوع العملية', en: 'Operation Mode', fr: 'Mode d\'opération', es: 'Modo de operación', tr: 'İşlem Modu' },
      choices: {
        concat: { ar: 'دمج مقاطع الفيديو بالتتابع', en: 'Merge videos sequentially', fr: 'Fusionner les vidéos à la suite', es: 'Combinar vídeos en secuencia', tr: 'Videoları sırayla birleştir' },
        compress: { ar: 'ضغط الفيديو لتقليل الحجم', en: 'Compress video size', fr: 'Compresser la taille vidéo', es: 'Comprimir tamaño de vídeo', tr: 'Video boyutunu sıkıştır' },
        enhance: { ar: 'تحسين الجودة وإزالة التشويش', en: 'Enhance & Denoise', fr: 'Améliorer et débruiter', es: 'Mejorar y reducir ruido', tr: 'İyileştir ve paraziti temizle' }
      }
    },
    target: {
      label: { ar: 'استخراج', en: 'Extract', fr: 'Extraire', es: 'Extraer', tr: 'Ayıkla' },
      choices: {
        video: { ar: 'استخراج فيديو صامت فقط', en: 'Extract silent video only', fr: 'Extraire vidéo muette seulement', es: 'Extraer solo vídeo silencioso', tr: 'Yalnızca sessiz video ayıkla' },
        audio: { ar: 'استخراج ملف الصوت فقط', en: 'Extract audio file only', fr: 'Extraire le fichier audio seulement', es: 'Extraer solo archivo de audio', tr: 'Yalnızca ses dosyasını ayıkla' }
      }
    },
    ratio: {
      label: { ar: 'نسبة الأبعاد', en: 'Aspect Ratio', fr: 'Format d\'image', es: 'Relación de aspecto', tr: 'En-Boy Oranı' },
      choices: {
        '16:9': { ar: '16:9 عريض', en: '16:9 Widescreen', fr: '16:9 Écran large', es: '16:9 Panorámico', tr: '16:9 Geniş Ekran' },
        '9:16': { ar: '9:16 طولي ريلز وتيك توك', en: '9:16 Vertical (Reels/TikTok)', fr: '9:16 Vertical (Reels/TikTok)', es: '9:16 Vertical (Reels/TikTok)', tr: '9:16 Dikey (Reels/TikTok)' },
        '1:1': { ar: '1:1 مربع', en: '1:1 Square', fr: '1:1 Carré', es: '1:1 Cuadrado', tr: '1:1 Kare' },
        '4:3': { ar: '4:3 تقليدي', en: '4:3 Standard', fr: '4:3 Standard', es: '4:3 Estándar', tr: '4:3 Standart' }
      }
    },
    width: {
      label: { ar: 'العرض (بكسل)', en: 'Width (pixels)', fr: 'Largeur (pixels)', es: 'Ancho (píxeles)', tr: 'Genişlik (piksel)' }
    },
    duration: {
      label: { ar: 'أقصى مدة (ثواني)', en: 'Max Duration (seconds)', fr: 'Durée maximale (secondes)', es: 'Duración máxima (segundos)', tr: 'Maksimum Süre (saniye)' }
    },
    outputExt: {
      label: { ar: 'الصيغة الناتجة', en: 'Output Format', fr: 'Format de sortie', es: 'Formato de salida', tr: 'Çıktı Formatı' }
    },
    start: {
      label: { ar: 'وقت البداية', en: 'Start Time', fr: 'Heure de début', es: 'Tiempo de inicio', tr: 'Başlangıç Zamanı' }
    },
    end: {
      label: { ar: 'وقت النهاية', en: 'End Time', fr: 'Heure de fin', es: 'Tiempo de fin', tr: 'Bitiş Zamanı' }
    },
    interval: {
      label: { ar: 'استخراج صورة كل (ثانية)', en: 'Extract frame every (sec)', fr: 'Extraire une image chaque (sec)', es: 'Extraer fotograma cada (seg)', tr: 'Her (saniyede) kare ayıkla' }
    },
    url: {
      label: { ar: 'رابط الفيديو المباشر', en: 'Direct Video URL', fr: 'URL directe de la vidéo', es: 'URL directa del vídeo', tr: 'Doğrudan Video Bağlantısı' }
    }
  };

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

        const optTrans = OPTION_TRANSLATIONS[opt.key];
        const labelText = optTrans?.label?.[currentLang] || optTrans?.label?.ar || opt.label;

        const label = document.createElement('label');
        label.textContent = labelText;
        row.appendChild(label);

        let input;
        if (opt.type === 'select') {
          input = document.createElement('select');
          input.id = `tool-opt-${opt.key}`;
          opt.choices.forEach(([val, defaultText]) => {
            const option = document.createElement('option');
            option.value = val;
            const choiceText = optTrans?.choices?.[val]?.[currentLang] || optTrans?.choices?.[val]?.ar || defaultText;
            option.textContent = choiceText;
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
      const statusText = (task.status === 'converting' && task.statusMsg) ? task.statusMsg : (statusMap[task.status] || task.status);

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
          <div class="task-status" style="color:${task.status === 'completed' ? 'var(--success)' : task.status === 'failed' ? 'var(--danger)' : task.status === 'cancelled' ? '#94a3b8' : ''}">
            ${statusText}${task.error && task.status !== 'cancelled' ? ` <span style="font-size:10px;opacity:0.85;">(${task.error})</span>` : ''}${task.status === 'converting' ? ` (${Math.round(task.progress)}%)` : ''}
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

        if (result.cancelled || task.status === 'cancelled') {
          task.status = 'cancelled';
          task.error = null;
        } else if (result.error) {
          task.status = 'failed';
          task.error = result.error;
        } else {
          task.status = 'completed';
          task.progress = 100;
          if (result.outputPath) task.outputPath = result.outputPath;
        }
      } catch (e) {
        if (task.status === 'cancelled') {
          task.error = null;
        } else {
          task.status = 'failed';
          task.error = e.message;
        }
      }

      renderTasks();
    }

    isConverting = false;
    const finalElapsedSec = elapsedSeconds;
    stopElapsedTimer();

    const h = Math.floor(finalElapsedSec / 3600).toString().padStart(2, '0');
    const m = Math.floor((finalElapsedSec % 3600) / 60).toString().padStart(2, '0');
    const s = (finalElapsedSec % 60).toString().padStart(2, '0');
    const elapsedStr = `${h}:${m}:${s}`;

    const completedCount = queuedTasks.filter(t => t.status === 'completed').length;
    const failedCount = queuedTasks.filter(t => t.status === 'failed').length;

    // 1. Sound Alerts
    if (completedCount > 0 && settings.soundComplete !== false) {
      playAudioAlert('success');
    } else if (failedCount > 0 && settings.soundFail !== false) {
      playAudioAlert('fail');
    }

    // 2. In-App Notification Window & Native System Toast
    const shouldNotify = (document.getElementById('chk-notify')?.checked || settings.notifyComplete !== false);
    if (shouldNotify && (completedCount > 0 || failedCount > 0)) {
      showCompletionNotification(elapsedStr, completedCount || queuedTasks.length);
    }

    // 3. Open output folder automatically if enabled
    if (settings.openFolderAfter) {
      window.api.openFolder();
    }

    // 4. Shutdown PC if enabled and tasks completed
    const shouldShutdown = (document.getElementById('chk-shutdown')?.checked || !!settings.shutdownAfter);
    if (shouldShutdown && completedCount > 0) {
      startShutdownCountdown();
    }
  }

  // ========== In-App Audio & Notification & Shutdown Engine ==========
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) audioCtx = new AudioCtxClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playAudioAlert(type = 'success') {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      if (type === 'success') {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.09);

          const start = ctx.currentTime + idx * 0.09;
          gain.gain.setValueAtTime(0, start);
          gain.gain.linearRampToValueAtTime(0.22, start + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.55);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + 0.6);
        });
      } else if (type === 'fail') {
        const notes = [392.00, 311.13];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.15);

          const start = ctx.currentTime + idx * 0.15;
          gain.gain.setValueAtTime(0, start);
          gain.gain.linearRampToValueAtTime(0.25, start + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.4);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + 0.45);
        });
      }
    } catch (e) {
      console.warn('Audio alert error:', e);
    }
  }

  let notifyDismissTimeout = null;

  function showCompletionNotification(elapsedStr, count) {
    const b = I18N[currentLang] || I18N.ar;
    const notifyEl = document.getElementById('app-complete-notify');

    // 1. Always trigger native OS notification and taskbar flash
    if (window.api?.notifyTaskComplete) {
      const title = b.notify_title || 'اكتمل التحويل';
      const msg = b.notify_all_completed || 'اكتملت جميع عمليات التحويل بنجاح!';
      window.api.notifyTaskComplete({
        title: `FormaLux - ${title}`,
        message: `${msg} (${b.notify_elapsed || 'الوقت:'} ${elapsedStr})`,
        elapsed: elapsedStr
      });
    }

    if (!notifyEl) {
      console.warn('app-complete-notify element missing from DOM');
      return;
    }

    if (notifyDismissTimeout) {
      clearTimeout(notifyDismissTimeout);
      notifyDismissTimeout = null;
    }

    const elapsedValEl = document.getElementById('notify-elapsed-val');
    const tasksCountEl = document.getElementById('notify-tasks-count');
    const mainTextEl = document.getElementById('notify-main-text');

    if (elapsedValEl) elapsedValEl.textContent = elapsedStr || '00:00:00';
    if (tasksCountEl) {
      const template = b.notify_tasks_done || '{count} tasks completed';
      tasksCountEl.textContent = template.replace('{count}', count || 1);
    }
    if (mainTextEl) mainTextEl.textContent = b.notify_all_completed || 'All conversions completed successfully!';

    notifyEl.classList.remove('hidden', 'hiding');
    notifyEl.style.display = 'block';

    notifyDismissTimeout = setTimeout(() => {
      closeCompletionNotification();
    }, 15000);
  }

  function closeCompletionNotification() {
    const notifyEl = document.getElementById('app-complete-notify');
    if (!notifyEl || notifyEl.classList.contains('hidden')) return;
    notifyEl.classList.add('hiding');
    setTimeout(() => {
      notifyEl.classList.add('hidden');
      notifyEl.classList.remove('hiding');
      notifyEl.style.display = 'none';
    }, 280);
    if (notifyDismissTimeout) {
      clearTimeout(notifyDismissTimeout);
      notifyDismissTimeout = null;
    }
  }

  let shutdownCountdownInterval = null;
  let shutdownSecondsRemaining = 30;

  function startShutdownCountdown() {
    // 1. Immediately schedule system-level shutdown command via Windows shutdown.exe
    if (window.api?.shutdownSystem) {
      window.api.shutdownSystem(30);
    }

    // 2. Bring window to front so the user sees the countdown overlay
    if (window.api?.focusWindow) {
      window.api.focusWindow();
    }

    // 3. Show the UI countdown overlay with Cancel button
    const overlay = document.getElementById('app-shutdown-overlay');
    const timerDisplay = document.getElementById('shutdown-timer-display');
    if (overlay) {
      shutdownSecondsRemaining = 30;
      if (timerDisplay) timerDisplay.textContent = '00:30';
      overlay.classList.remove('hidden');
      overlay.style.display = 'flex';
    }

    if (shutdownCountdownInterval) clearInterval(shutdownCountdownInterval);
    shutdownCountdownInterval = setInterval(() => {
      shutdownSecondsRemaining--;
      if (shutdownSecondsRemaining < 0) {
        clearInterval(shutdownCountdownInterval);
        shutdownCountdownInterval = null;
        return;
      }
      const s = shutdownSecondsRemaining.toString().padStart(2, '0');
      if (timerDisplay) timerDisplay.textContent = `00:${s}`;
    }, 1000);
  }

  function cancelShutdownCountdown() {
    if (shutdownCountdownInterval) {
      clearInterval(shutdownCountdownInterval);
      shutdownCountdownInterval = null;
    }
    if (window.api?.cancelShutdown) {
      window.api.cancelShutdown();
    }

    const overlay = document.getElementById('app-shutdown-overlay');
    if (overlay) {
      overlay.classList.add('hidden');
      overlay.style.display = 'none';
    }

    const chk = document.getElementById('chk-shutdown');
    if (chk) chk.checked = false;
    const optShut = document.getElementById('opt-shutdown');
    if (optShut) optShut.checked = false;
    settings.shutdownAfter = false;
    window.api.saveSettings(settings);

    const b = I18N[currentLang] || I18N.ar;
    alert(b.shutdown_cancelled || 'Shutdown cancelled successfully');
  }

  function setupNotificationAndShutdownUI() {
    document.getElementById('notify-btn-close')?.addEventListener('click', closeCompletionNotification);
    document.getElementById('notify-btn-ok')?.addEventListener('click', closeCompletionNotification);
    document.getElementById('notify-btn-folder')?.addEventListener('click', () => {
      closeCompletionNotification();
      window.api.openFolder();
    });
    document.getElementById('btn-cancel-shutdown')?.addEventListener('click', cancelShutdownCountdown);
  }

  function stopAllTasks() {
    isConverting = false;
    tasks.forEach(task => {
      if (task.status === 'converting') {
        task.status = 'cancelled';
        task.error = null;
        window.api.cancelTask(task.id);
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
        if (data.statusMsg) task.statusMsg = data.statusMsg;
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
        if (task.status === 'cancelled') return;
        task.status = 'failed';
        task.error = data.error || (data.code ? `Exit code ${data.code}` : 'Failed');
        renderTasks();
      }
    });

    window.api.onTaskCancelled?.((data) => {
      const task = tasks.find(t => t.id === data.taskId);
      if (task) {
        task.status = 'cancelled';
        task.error = null;
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
        closeUpdatesModal();
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
        const repo = settings.githubRepo || 'mohammadfahmi2030/FormaLux';
        const url = repo.startsWith('http') ? repo : `https://github.com/${repo}`;
        window.api.openExternalUrl(url);
      });

      // Updates modal
      document.getElementById('close-updates')?.addEventListener('click', closeUpdatesModal);
      document.getElementById('btn-close-updates-ok')?.addEventListener('click', closeUpdatesModal);
      document.getElementById('updates-btn-retry')?.addEventListener('click', () => triggerCheckForUpdates(true));
      document.getElementById('updates-btn-releases-page')?.addEventListener('click', () => {
        const repo = settings.githubRepo || 'mohammadfahmi2030/FormaLux';
        window.api.openExternalUrl(`https://github.com/${repo}/releases`);
      });
      document.getElementById('updates-btn-download-now')?.addEventListener('click', () => {
        const repo = settings.githubRepo || 'mohammadfahmi2030/FormaLux';
        const url = updateLatestDownloadUrl || `https://github.com/${repo}/releases/latest`;
        window.api.openExternalUrl(url);
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
    try { setupVideoMuxModal(); } catch (e) { console.error('setupVideoMuxModal error:', e); }
    try { setupAudioMixModal(); } catch (e) { console.error('setupAudioMixModal error:', e); }
    try { setupAudioJoinModal(); } catch (e) { console.error('setupAudioJoinModal error:', e); }
    try { setupDocumentTaskModals(); } catch (e) { console.error('setupDocumentTaskModals error:', e); }
    try { setupDiscTaskModals(); } catch (e) { console.error('setupDiscTaskModals error:', e); }
    try { setupDvdIsoModal(); } catch (e) { console.error('setupDvdIsoModal error:', e); }
    try { setupCsoCompressModal(); } catch (e) { console.error('setupCsoCompressModal error:', e); }
    try { setupCdAudioModal(); } catch (e) { console.error('setupCdAudioModal error:', e); }
    try { setupDvdRipperModPrompt(); } catch (e) { console.error('setupDvdRipperModPrompt error:', e); }
    try { setupHaTestHandlers(); } catch (e) { console.error('setupHaTestHandlers error:', e); }
  }

  function openOptionsModal() {
    const modal = document.getElementById('options-modal');
    document.getElementById('opt-output-dir').value = settings.outputDir || '';
    document.getElementById('opt-same-folder').checked = settings.outputToSameFolder || false;
    document.getElementById('opt-sub-folder').checked = settings.outputToSubFolder || false;
    document.getElementById('opt-shutdown').checked = settings.shutdownAfter || false;
    document.getElementById('opt-open-folder').checked = settings.openFolderAfter || false;
    const optNotify = document.getElementById('opt-notify-complete');
    if (optNotify) optNotify.checked = settings.notifyComplete !== false;
    document.getElementById('opt-sound-general').checked = settings.soundGeneral || false;
    document.getElementById('opt-sound-complete').checked = settings.soundComplete !== false;
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
    const optNotify = document.getElementById('opt-notify-complete');
    if (optNotify) settings.notifyComplete = optNotify.checked;
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
    const chkShutdown = document.getElementById('chk-shutdown');
    if (chkShutdown) chkShutdown.checked = settings.shutdownAfter;
    const chkNotify = document.getElementById('chk-notify');
    if (chkNotify) chkNotify.checked = settings.notifyComplete !== false;
    await window.api.saveSettings(settings);
    updateOutputPathDisplay();
  }

  let updateLatestDownloadUrl = '';

  function openUpdatesModal() {
    const modal = document.getElementById('updates-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
  }

  function closeUpdatesModal() {
    const modal = document.getElementById('updates-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
    }
  }

  async function triggerCheckForUpdates(manual = true) {
    const isAr = currentLang === 'ar';
    const b = I18N[currentLang] || I18N.ar;
    const repo = settings.githubRepo || 'mohammadfahmi2030/FormaLux';

    const stateChecking = document.getElementById('updates-state-checking');
    const stateLatest = document.getElementById('updates-state-latest');
    const stateAvailable = document.getElementById('updates-state-available');
    const stateError = document.getElementById('updates-state-error');

    const checkingRepoEl = document.getElementById('updates-checking-repo');
    if (checkingRepoEl) checkingRepoEl.textContent = repo;

    const curVerLabel = document.getElementById('updates-current-version-label');

    // 1. Reset states: show checking, hide all others
    if (stateChecking) { stateChecking.classList.remove('hidden'); stateChecking.style.display = 'flex'; }
    if (stateLatest) { stateLatest.classList.add('hidden'); stateLatest.style.display = 'none'; }
    if (stateAvailable) { stateAvailable.classList.add('hidden'); stateAvailable.style.display = 'none'; }
    if (stateError) { stateError.classList.add('hidden'); stateError.style.display = 'none'; }

    // If triggered manually, open modal immediately with checking spinner
    if (manual) {
      openUpdatesModal();
    }

    try {
      const res = await window.api.checkForUpdates(repo);
      if (curVerLabel) {
        const curTpl = b.updates_current_ver || 'الإصدار المثبت حالياً: {version}';
        curVerLabel.textContent = curTpl.replace('{version}', `v${res.currentVersion || '1.0.0'}`);
      }

      if (stateChecking) { stateChecking.classList.add('hidden'); stateChecking.style.display = 'none'; }

      if (res.hasUpdate) {
        // State 3: Update Available
        updateLatestDownloadUrl = res.downloadUrl || res.releaseUrl || `https://github.com/${repo}/releases`;
        const availVerEl = document.getElementById('updates-avail-ver');
        const availNotesEl = document.getElementById('updates-avail-notes');
        if (availVerEl) availVerEl.textContent = `v${res.latestVersion || '1.0.1'}`;
        if (availNotesEl) {
          availNotesEl.textContent = res.releaseNotes?.trim() || (isAr ? 'تحديث جديد لتحسين الأداء وإضافة مميزات جديدة.' : 'New update with performance improvements and new features.');
        }

        if (stateAvailable) {
          stateAvailable.classList.remove('hidden');
          stateAvailable.style.display = 'flex';
        }
        if (!manual) openUpdatesModal();
      } else if (res.status === 'error' || res.status === 'invalid_repo') {
        // State 4: Error
        if (manual) {
          const errDescEl = document.getElementById('updates-err-desc');
          if (errDescEl) errDescEl.textContent = res.message || res.error || (isAr ? 'تعذر الاتصال بـ GitHub، يرجى التأكد من اتصالك بالإنترنت.' : 'Could not connect to GitHub.');
          if (stateError) {
            stateError.classList.remove('hidden');
            stateError.style.display = 'flex';
          }
        }
      } else {
        // State 2: Up to Date
        if (manual) {
          const timeEl = document.getElementById('updates-latest-time');
          const repoEl = document.getElementById('updates-latest-repo');
          if (timeEl) {
            const now = new Date();
            timeEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          }
          if (repoEl) repoEl.textContent = repo;
          if (stateLatest) {
            stateLatest.classList.remove('hidden');
            stateLatest.style.display = 'flex';
          }
        }
      }
    } catch (e) {
      if (stateChecking) { stateChecking.classList.add('hidden'); stateChecking.style.display = 'none'; }
      if (manual) {
        const errDescEl = document.getElementById('updates-err-desc');
        if (errDescEl) errDescEl.textContent = e.message || (isAr ? 'تعذر الاتصال بخادم التحديثات.' : 'Failed to reach updates server.');
        if (stateError) {
          stateError.classList.remove('hidden');
          stateError.style.display = 'flex';
        }
      }
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
  // UTILITIES: HARDWARE ACCELERATION TESTING MODAL
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
        if (r.name.includes('NVIDIA') || r.name.startsWith('NV')) {
          vendor = 'NVIDIA';
          vendorClass = 'ha-vendor-nvidia';
        } else if (r.name.includes('AMD') || r.name.startsWith('AMF')) {
          vendor = 'AMD';
          vendorClass = 'ha-vendor-amd';
        } else if (r.name.includes('Intel')) {
          vendor = 'Intel';
          vendorClass = 'ha-vendor-intel';
        } else if (r.name.includes('Microsoft') || r.name.startsWith('MF')) {
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
    const nonFormat = ['util_ha_test', 'v_player', 'v_merge', 'a_merge'];
    if (nonFormat.includes(toolType)) return false;
    return toolType.startsWith('v_') || toolType.startsWith('a_') || toolType.startsWith('i_') || toolType === 'disc_iso_cso';
  }

  // =========================================================
  // VIDEO JOINER & MUX MODAL ENGINE (Format Factory Style)
  // =========================================================
  let vmuxVideoFiles = [];
  let vmuxAudioFiles = [];
  let vmuxActiveTab = 'video';
  let vmuxVideoPrevVol = 100;
  let vmuxAudioPrevVol = 100;

  function updateVmuxVolumeUI(type, val) {
    const isVideo = type === 'video';
    const slider = document.getElementById(isVideo ? 'vmux-video-volume' : 'vmux-audio-volume');
    const badge = document.getElementById(isVideo ? 'vmux-video-vol-badge' : 'vmux-audio-vol-badge');
    const icon = document.getElementById(isVideo ? 'vmux-video-vol-icon' : 'vmux-audio-vol-icon');
    val = Math.max(0, Math.min(100, parseInt(val !== undefined && val !== null ? val : '100', 10)));
    
    const isRtl = (document.documentElement.getAttribute('dir') === 'rtl') || (currentLang === 'ar');

    if (slider) {
      slider.value = val;
      slider.dir = isRtl ? 'rtl' : 'ltr';
      slider.style.direction = isRtl ? 'rtl' : 'ltr';
      const primaryCol = isVideo ? '#0284c7' : '#db2777';
      const secondaryCol = isVideo ? '#38bdf8' : '#f472b6';
      const gradDir = isRtl ? 'to left' : 'to right';
      slider.style.background = `linear-gradient(${gradDir}, ${primaryCol} 0%, ${secondaryCol} ${val}%, rgba(255,255,255,0.14) ${val}%, rgba(255,255,255,0.14) 100%)`;
    }
    if (badge) {
      badge.textContent = `${val}%`;
    }
    if (icon) {
      if (val === 0) {
        icon.innerHTML = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>';
      } else if (val < 50) {
        icon.innerHTML = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>';
      } else {
        icon.innerHTML = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>';
      }
    }
  }

  function setupVideoMuxModal() {
    document.getElementById('vmux-btn-close')?.addEventListener('click', () => {
      document.getElementById('modal-video-mux')?.classList.add('hidden');
    });

    document.getElementById('vmux-btn-output-setting')?.addEventListener('click', () => {
      openSettingModal('video');
    });

    document.getElementById('vmux-tab-video')?.addEventListener('click', () => switchVmuxTab('video'));
    document.getElementById('vmux-tab-audio')?.addEventListener('click', () => switchVmuxTab('audio'));

    // Video buttons (Add Video & Add Picture)
    document.getElementById('vmux-btn-center-add-video')?.addEventListener('click', promptAddVmuxVideoFiles);
    document.getElementById('vmux-btn-table-add-video')?.addEventListener('click', promptAddVmuxVideoFiles);
    document.getElementById('vmux-btn-center-add-pic')?.addEventListener('click', promptAddVmuxPictureFiles);
    document.getElementById('vmux-btn-table-add-pic')?.addEventListener('click', promptAddVmuxPictureFiles);

    document.getElementById('vmux-video-volume')?.addEventListener('input', (e) => {
      updateVmuxVolumeUI('video', e.target.value);
    });

    document.getElementById('vmux-video-vol-toggle')?.addEventListener('click', () => {
      const slider = document.getElementById('vmux-video-volume');
      const cur = parseInt(slider?.value || '100', 10);
      if (cur > 0) {
        vmuxVideoPrevVol = cur;
        updateVmuxVolumeUI('video', 0);
      } else {
        updateVmuxVolumeUI('video', vmuxVideoPrevVol || 100);
      }
    });

    // Audio buttons (Add Audio)
    document.getElementById('vmux-btn-center-add-audio')?.addEventListener('click', promptAddVmuxAudioFiles);
    document.getElementById('vmux-btn-table-add-audio')?.addEventListener('click', promptAddVmuxAudioFiles);

    document.getElementById('vmux-audio-volume')?.addEventListener('input', (e) => {
      updateVmuxVolumeUI('audio', e.target.value);
    });

    document.getElementById('vmux-audio-vol-toggle')?.addEventListener('click', () => {
      const slider = document.getElementById('vmux-audio-volume');
      const cur = parseInt(slider?.value || '100', 10);
      if (cur > 0) {
        vmuxAudioPrevVol = cur;
        updateVmuxVolumeUI('audio', 0);
      } else {
        updateVmuxVolumeUI('audio', vmuxAudioPrevVol || 100);
      }
    });

    // OK Buttons
    document.getElementById('vmux-btn-ok')?.addEventListener('click', confirmVmuxTask);
    document.getElementById('vmux-btn-audio-ok')?.addEventListener('click', confirmVmuxTask);
  }

  function openVideoMuxModal(initialFiles = []) {
    vmuxVideoFiles = [];
    vmuxAudioFiles = [];
    if (initialFiles && initialFiles.length > 0) {
      initialFiles.forEach(f => {
        const ext = f.split('.').pop().toLowerCase();
        if (['mp3','wav','aac','m4a','flac','ogg','wma'].includes(ext)) {
          vmuxAudioFiles.push({ path: f, name: f.split(/[/\\]/).pop(), size: '...', duration: '--:--', bitrate: 'Default' });
        } else {
          vmuxVideoFiles.push({ path: f, name: f.split(/[/\\]/).pop(), size: '...', duration: '--:--', resolution: 'Default', isPic: ['jpg','jpeg','png','webp','bmp'].includes(ext) });
        }
      });
    }
    switchVmuxTab('video');
    updateVmuxVolumeUI('video', 100);
    updateVmuxVolumeUI('audio', 100);
    renderVmuxVideoTable();
    renderVmuxAudioTable();
    document.getElementById('modal-video-mux')?.classList.remove('hidden');
  }

  function switchVmuxTab(tab) {
    vmuxActiveTab = tab;
    const vTab = document.getElementById('vmux-tab-video');
    const aTab = document.getElementById('vmux-tab-audio');
    const vPanel = document.getElementById('vmux-panel-video');
    const aPanel = document.getElementById('vmux-panel-audio');

    if (tab === 'video') {
      vTab?.classList.add('active');
      aTab?.classList.remove('active');
      vPanel?.classList.remove('hidden');
      aPanel?.classList.add('hidden');
    } else {
      aTab?.classList.add('active');
      vTab?.classList.remove('active');
      aPanel?.classList.remove('hidden');
      vPanel?.classList.add('hidden');
    }
  }

  async function promptAddVmuxVideoFiles() {
    const filters = [{ name: 'Video Files', extensions: ['mp4', 'mkv', 'avi', 'mov', 'ts', 'flv', 'wmv', 'webm', '3gp', 'mpg', 'vob', 'm4v'] }];
    const files = await window.api.selectFiles(filters);
    if (files && files.length > 0) {
      for (const f of files) {
        if (!vmuxVideoFiles.some(x => x.path === f)) {
          vmuxVideoFiles.push({
            path: f,
            name: f.split(/[/\\]/).pop(),
            size: '...',
            duration: '--:--',
            resolution: 'Default',
            isPic: false
          });
        }
      }
      renderVmuxVideoTable();
    }
  }

  async function promptAddVmuxPictureFiles() {
    const filters = [{ name: 'Picture Files', extensions: ['jpg', 'jpeg', 'png', 'bmp', 'webp', 'gif', 'tiff', 'ico'] }];
    const files = await window.api.selectFiles(filters);
    if (files && files.length > 0) {
      for (const f of files) {
        if (!vmuxVideoFiles.some(x => x.path === f)) {
          vmuxVideoFiles.push({
            path: f,
            name: f.split(/[/\\]/).pop(),
            size: '...',
            duration: '00:00:05',
            resolution: 'Picture',
            isPic: true
          });
        }
      }
      renderVmuxVideoTable();
    }
  }

  async function promptAddVmuxVideoFolder() {
    const folder = await window.api.selectFolder();
    if (folder) {
      const exts = ['mp4', 'mkv', 'avi', 'mov', 'ts', 'flv', 'wmv', 'webm', 'jpg', 'png', 'jpeg'];
      const found = await window.api.scanFolder(folder, exts);
      if (found && found.length > 0) {
        found.forEach(f => {
          if (!vmuxVideoFiles.some(x => x.path === f)) {
            const ext = f.split('.').pop().toLowerCase();
            const isPic = ['jpg', 'jpeg', 'png', 'webp', 'bmp'].includes(ext);
            vmuxVideoFiles.push({
              path: f,
              name: f.split(/[/\\]/).pop(),
              size: '...',
              duration: isPic ? '00:00:05' : '--:--',
              resolution: isPic ? 'Picture' : 'Default',
              isPic
            });
          }
        });
        renderVmuxVideoTable();
      }
    }
  }

  async function promptAddVmuxAudioFiles() {
    const filters = [{ name: 'Audio Files', extensions: ['mp3', 'wav', 'aac', 'm4a', 'flac', 'ogg', 'wma', 'opus', 'ac3'] }];
    const files = await window.api.selectFiles(filters);
    if (files && files.length > 0) {
      for (const f of files) {
        if (!vmuxAudioFiles.some(x => x.path === f)) {
          vmuxAudioFiles.push({
            path: f,
            name: f.split(/[/\\]/).pop(),
            size: '...',
            duration: '--:--',
            bitrate: 'Default'
          });
        }
      }
      renderVmuxAudioTable();
    }
  }

  async function promptAddVmuxAudioFolder() {
    const folder = await window.api.selectFolder();
    if (folder) {
      const exts = ['mp3', 'wav', 'aac', 'm4a', 'flac', 'ogg', 'wma'];
      const found = await window.api.scanFolder(folder, exts);
      if (found && found.length > 0) {
        found.forEach(f => {
          if (!vmuxAudioFiles.some(x => x.path === f)) {
            vmuxAudioFiles.push({
              path: f,
              name: f.split(/[/\\]/).pop(),
              size: '...',
              duration: '--:--',
              bitrate: 'Default'
            });
          }
        });
        renderVmuxAudioTable();
      }
    }
  }

  function renderVmuxVideoTable() {
    const emptyBox = document.getElementById('vmux-video-empty');
    const table = document.getElementById('vmux-video-table');
    const tbody = document.getElementById('vmux-video-tbody');
    const actions = document.getElementById('vmux-video-table-actions');
    if (!emptyBox || !table || !tbody) return;

    if (vmuxVideoFiles.length === 0) {
      emptyBox.style.display = 'flex';
      table.style.display = 'none';
      if (actions) actions.style.display = 'none';
      tbody.innerHTML = '';
      return;
    }

    emptyBox.style.display = 'none';
    table.style.display = 'table';
    if (actions) actions.style.display = 'flex';
    tbody.innerHTML = '';

    vmuxVideoFiles.forEach((file, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="text-align: center; font-size: 18px;">${file.isPic ? '🖼️' : '🎬'}</td>
        <td style="font-weight: 500; max-width: 380px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${file.path}">
          ${file.name}
          <div style="font-size: 11px; color: var(--text-muted);">${file.path}</div>
        </td>
        <td style="text-align: center; color: var(--text-secondary); font-size: 12px;">${file.duration}</td>
        <td style="text-align: center; color: var(--text-secondary); font-size: 12px;">${file.resolution}</td>
        <td style="text-align: center; color: var(--text-secondary); font-size: 12px;">${file.size}</td>
        <td style="text-align: center;">
          <button class="ft-row-action-btn danger" style="padding: 2px 6px; border: none; background: transparent; color: #ef4444; cursor: pointer;" title="Delete" data-idx="${idx}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </td>
      `;
      tr.querySelector('button')?.addEventListener('click', () => {
        vmuxVideoFiles.splice(idx, 1);
        renderVmuxVideoTable();
      });
      tbody.appendChild(tr);
    });
  }

  function renderVmuxAudioTable() {
    const emptyBox = document.getElementById('vmux-audio-empty');
    const table = document.getElementById('vmux-audio-table');
    const tbody = document.getElementById('vmux-audio-tbody');
    if (!emptyBox || !table || !tbody) return;

    if (vmuxAudioFiles.length === 0) {
      emptyBox.style.display = 'flex';
      table.style.display = 'none';
      tbody.innerHTML = '';
      return;
    }

    emptyBox.style.display = 'none';
    table.style.display = 'table';
    tbody.innerHTML = '';

    vmuxAudioFiles.forEach((file, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="text-align: center; font-size: 18px;">🎵</td>
        <td style="font-weight: 500; max-width: 380px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${file.path}">
          ${file.name}
          <div style="font-size: 11px; color: var(--text-muted);">${file.path}</div>
        </td>
        <td style="text-align: center; color: var(--text-secondary); font-size: 12px;">${file.duration}</td>
        <td style="text-align: center; color: var(--text-secondary); font-size: 12px;">${file.bitrate}</td>
        <td style="text-align: center; color: var(--text-secondary); font-size: 12px;">${file.size}</td>
        <td style="text-align: center;">
          <button class="ft-row-action-btn danger" style="padding: 2px 6px; border: none; background: transparent; color: #ef4444; cursor: pointer;" title="Delete" data-idx="${idx}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </td>
      `;
      tr.querySelector('button')?.addEventListener('click', () => {
        vmuxAudioFiles.splice(idx, 1);
        renderVmuxAudioTable();
      });
      tbody.appendChild(tr);
    });
  }

  function confirmVmuxTask() {
    if (vmuxVideoFiles.length === 0 && vmuxAudioFiles.length === 0) {
      alert(currentLang === 'ar' ? 'الرجاء إضافة ملف واحد على الأقل للمتابعة' : 'Please add at least one file to proceed');
      return;
    }
    const fmt = document.getElementById('vmux-output-format')?.value || 'mp4';
    const vVol = parseInt(document.getElementById('vmux-video-volume')?.value || '100', 10);
    const aVol = parseInt(document.getElementById('vmux-audio-volume')?.value || '100', 10);
    const loop = document.getElementById('vmux-audio-loop')?.value === '1';
    const intervals = parseInt(document.getElementById('vmux-audio-intervals')?.value || '0', 10);

    const inputs = vmuxVideoFiles.map(f => f.path);
    if (inputs.length === 0) {
      inputs.push(...vmuxAudioFiles.map(f => f.path));
    }

    const b = I18N[currentLang] || I18N.ar;
    const taskTitle = b.vmux_title || 'Video Joiner & Mux';
    const vCountLabel = currentLang === 'ar' ? `${vmuxVideoFiles.length} فيديو/صورة` : `${vmuxVideoFiles.length} video/pic`;
    const aCountLabel = currentLang === 'ar' ? `${vmuxAudioFiles.length} صوت` : `${vmuxAudioFiles.length} audio`;

    addTask({
      type: 'v_merge',
      input: inputs,
      options: {
        outputExt: '.' + fmt,
        videoFiles: vmuxVideoFiles.map(f => f.path),
        audioFiles: vmuxAudioFiles.map(f => f.path),
        videoVolume: vVol,
        audioVolume: aVol,
        loop,
        intervals,
        outputDir: settings.outputDir || 'D:\\FLoutput'
      },
      name: `${taskTitle} (${vCountLabel} + ${aCountLabel})`
    });

    document.getElementById('modal-video-mux')?.classList.add('hidden');
  }

  // =========================================================
  // AUDIO MIX MODAL ENGINE (Format Factory Style)
  // =========================================================
  let amixFiles = [];

  function setupAudioMixModal() {
    // Close button
    document.getElementById('amix-btn-close')?.addEventListener('click', closeAudioMixModal);

    // Output Setting button & Preset Badge -> opens audio settings modal strictly in front
    document.getElementById('amix-btn-output-setting')?.addEventListener('click', () => {
      openSettingModal('audio');
    });
    document.getElementById('amix-preset-name')?.addEventListener('click', () => {
      openSettingModal('audio');
    });

    document.getElementById('amix-output-format')?.addEventListener('change', (e) => {
      const val = e.target.value.toUpperCase();
      setSelectVal('as-opt-audio-encode', val);
      if (currentFormatOptions) currentFormatOptions.audioEncode = val;
    });

    // Add Files (Center empty button & Footer button)
    document.getElementById('amix-btn-center-add')?.addEventListener('click', promptAddAmixFiles);
    document.getElementById('amix-btn-footer-add')?.addEventListener('click', promptAddAmixFiles);

    // Clear button
    document.getElementById('amix-btn-clear')?.addEventListener('click', () => {
      amixFiles = [];
      renderAmixTable();
    });

    // OK / Confirm button
    document.getElementById('amix-btn-ok')?.addEventListener('click', confirmAudioMixTask);

    // Drag and drop onto modal
    const amixModal = document.getElementById('modal-audio-mix');
    if (amixModal) {
      amixModal.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
      amixModal.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer && e.dataTransfer.files) {
          const validExts = ['mp3', 'wav', 'aac', 'flac', 'm4a', 'ogg', 'wma', 'opus', 'ac3'];
          for (let i = 0; i < e.dataTransfer.files.length; i++) {
            const f = e.dataTransfer.files[i];
            const ext = f.name.split('.').pop().toLowerCase();
            if (validExts.includes(ext) && !amixFiles.some(x => x.path === f.path)) {
              addAmixFile(f.path);
            }
          }
        }
      });
    }
  }

  function openAudioMixModal(initialFiles = []) {
    currentMediaType = 'audio';
    currentFormatTool = 'a_mix';
    currentPresetKey = 'high';
    currentPresetName = AUDIO_PRESETS.high?.name || 'High quality';
    currentFormatOptions = { ...(AUDIO_PRESETS.high || {}) };
    updatePresetDisplays();

    amixFiles = [];
    const fmtSelect = document.getElementById('amix-output-format');
    if (fmtSelect) fmtSelect.value = 'mp3';
    const durSelect = document.getElementById('amix-duration-select');
    if (durSelect) durSelect.value = 'longest';

    if (initialFiles && initialFiles.length > 0) {
      const validExts = ['mp3', 'wav', 'aac', 'flac', 'm4a', 'ogg', 'wma', 'opus', 'ac3'];
      initialFiles.forEach(p => {
        const ext = p.split('.').pop().toLowerCase();
        if (validExts.includes(ext)) {
          addAmixFile(p);
        }
      });
    }

    renderAmixTable();
    document.getElementById('modal-audio-mix')?.classList.remove('hidden');
  }

  function closeAudioMixModal() {
    document.getElementById('modal-audio-mix')?.classList.add('hidden');
  }

  async function promptAddAmixFiles() {
    const filters = [{ name: 'Audio Files', extensions: ['mp3', 'wav', 'aac', 'm4a', 'flac', 'ogg', 'wma', 'opus', 'ac3'] }];
    const files = await window.api.selectFiles(filters);
    if (files && files.length > 0) {
      for (const p of files) {
        if (!amixFiles.some(x => x.path === p)) {
          addAmixFile(p);
        }
      }
    }
  }

  function addAmixFile(filePath) {
    const fileRecord = {
      path: filePath,
      name: filePath.split(/[/\\]/).pop(),
      size: '...',
      duration: '--:--',
      bitrate: 'Default'
    };
    amixFiles.push(fileRecord);
    renderAmixTable();

    // Async probe metadata
    if (window.api && window.api.getMediaInfo) {
      window.api.getMediaInfo(filePath).then(info => {
        if (!info) return;
        if (info.format) {
          if (info.format.size) fileRecord.size = formatBytes(parseInt(info.format.size));
          if (info.format.duration) fileRecord.duration = formatDuration(parseFloat(info.format.duration));
          if (info.format.bit_rate) fileRecord.bitrate = Math.round(parseInt(info.format.bit_rate) / 1000) + ' kbps';
        }
        renderAmixTable();
      }).catch(() => {});
    }
  }

  function renderAmixTable() {
    const emptyBox = document.getElementById('amix-empty-state');
    const tableWrapper = document.getElementById('amix-table-wrapper');
    const tbody = document.getElementById('amix-files-tbody');
    if (!emptyBox || !tableWrapper || !tbody) return;

    if (amixFiles.length === 0) {
      emptyBox.style.display = 'flex';
      tableWrapper.style.display = 'none';
      tbody.innerHTML = '';
      return;
    }

    emptyBox.style.display = 'none';
    tableWrapper.style.display = 'block';
    tbody.innerHTML = '';

    amixFiles.forEach((file, idx) => {
      const b = I18N[currentLang] || I18N.ar;
      const upTip = b.tip_move_up || 'تحريك لأعلى';
      const downTip = b.tip_move_down || 'تحريك لأسفل';
      const delTip = b.tip_delete || 'حذف';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="text-align: center; font-size: 18px;">🎵</td>
        <td style="font-weight: 500; max-width: 380px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${file.path}">
          <span style="color: var(--text-primary); font-weight: 600;">${file.name}</span>
          <div style="font-size: 11px; color: var(--text-muted);">${file.path}</div>
        </td>
        <td style="text-align: center; color: var(--text-secondary); font-size: 12px;">${file.duration}</td>
        <td style="text-align: center; color: var(--text-secondary); font-size: 12px;">${file.bitrate}</td>
        <td style="text-align: center; color: var(--text-secondary); font-size: 12px;">${file.size}</td>
        <td style="text-align: center; white-space: nowrap;">
          <button class="amix-row-btn" data-action="up" data-idx="${idx}" title="${upTip}" ${idx === 0 ? 'disabled' : ''}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
          </button>
          <button class="amix-row-btn" data-action="down" data-idx="${idx}" title="${downTip}" ${idx === amixFiles.length - 1 ? 'disabled' : ''}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <button class="amix-row-btn danger" data-action="del" data-idx="${idx}" title="${delTip}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </td>
      `;

      tr.querySelector('[data-action="up"]')?.addEventListener('click', () => {
        if (idx > 0) {
          const temp = amixFiles[idx];
          amixFiles[idx] = amixFiles[idx - 1];
          amixFiles[idx - 1] = temp;
          renderAmixTable();
        }
      });

      tr.querySelector('[data-action="down"]')?.addEventListener('click', () => {
        if (idx < amixFiles.length - 1) {
          const temp = amixFiles[idx];
          amixFiles[idx] = amixFiles[idx + 1];
          amixFiles[idx + 1] = temp;
          renderAmixTable();
        }
      });

      tr.querySelector('[data-action="del"]')?.addEventListener('click', () => {
        amixFiles.splice(idx, 1);
        renderAmixTable();
      });

      tbody.appendChild(tr);
    });
  }

  function confirmAudioMixTask() {
    const b = I18N[currentLang] || I18N.ar;
    if (amixFiles.length < 2) {
      alert(b.amix_warn_min_files || 'يرجى إضافة ملفين صوتيين على الأقل لدمجهما في المزيج');
      return;
    }

    const fmt = document.getElementById('amix-output-format')?.value || 'mp3';
    const duration = document.getElementById('amix-duration-select')?.value || 'longest';
    const taskTitle = b.amix_title || 'Audio Mix';
    const countLabel = currentLang === 'ar' ? `${amixFiles.length} ملفات صوتية` : `${amixFiles.length} audio tracks`;
    const presetName = document.getElementById('amix-preset-name')?.textContent || 'جودة عالية (320 ك.بت/ث)';

    addTask({
      type: 'a_mix',
      input: amixFiles.map(f => f.path),
      options: {
        duration,
        outputExt: '.' + fmt,
        presetName,
        outputDir: settings.outputDir || 'D:\\FLoutput',
        ...(currentFormatOptions || {})
      },
      name: `${taskTitle} (${countLabel}) [${fmt.toUpperCase()}]`
    });

    closeAudioMixModal();
  }

  // =========================================================
  // AUDIO JOINER MODAL ENGINE (Format Factory Style - 2 Files Only)
  // =========================================================
  let ajoinFiles = [];

  function setupAudioJoinModal() {
    // Close button
    document.getElementById('ajoin-btn-close')?.addEventListener('click', closeAudioJoinModal);

    // Output Setting button & Preset Badge -> opens audio settings modal strictly in front
    document.getElementById('ajoin-btn-output-setting')?.addEventListener('click', () => {
      openSettingModal('audio');
    });
    document.getElementById('ajoin-preset-name')?.addEventListener('click', () => {
      openSettingModal('audio');
    });

    document.getElementById('ajoin-output-format')?.addEventListener('change', (e) => {
      const val = e.target.value.toUpperCase();
      setSelectVal('as-opt-audio-encode', val);
      if (currentFormatOptions) currentFormatOptions.audioEncode = val;
    });

    // Add Files (Center empty button & Footer button)
    document.getElementById('ajoin-btn-center-add')?.addEventListener('click', promptAddAjoinFiles);
    document.getElementById('ajoin-btn-footer-add')?.addEventListener('click', promptAddAjoinFiles);

    // Clear button
    document.getElementById('ajoin-btn-clear')?.addEventListener('click', () => {
      ajoinFiles = [];
      renderAjoinTable();
    });

    // OK / Confirm button
    document.getElementById('ajoin-btn-ok')?.addEventListener('click', confirmAudioJoinTask);

    // Drag and drop onto modal
    const ajoinModal = document.getElementById('modal-audio-join');
    if (ajoinModal) {
      ajoinModal.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
      ajoinModal.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer && e.dataTransfer.files) {
          const validExts = ['mp3', 'wav', 'aac', 'flac', 'm4a', 'ogg', 'wma', 'opus', 'ac3'];
          const filesToAdd = [];
          for (let i = 0; i < e.dataTransfer.files.length; i++) {
            const f = e.dataTransfer.files[i];
            const ext = f.name.split('.').pop().toLowerCase();
            if (validExts.includes(ext) && !ajoinFiles.some(x => x.path === f.path)) {
              filesToAdd.push(f.path);
            }
          }
          addAjoinFilesBatch(filesToAdd);
        }
      });
    }
  }

  function openAudioJoinModal(initialFiles = []) {
    currentMediaType = 'audio';
    currentFormatTool = 'a_merge';
    currentPresetKey = 'high';
    currentPresetName = AUDIO_PRESETS.high?.name || 'High quality';
    currentFormatOptions = { ...(AUDIO_PRESETS.high || {}) };
    updatePresetDisplays();

    ajoinFiles = [];
    const fmtSelect = document.getElementById('ajoin-output-format');
    if (fmtSelect) fmtSelect.value = 'mp3';
    const intSelect = document.getElementById('ajoin-intervals-select');
    if (intSelect) intSelect.value = '0';

    if (initialFiles && initialFiles.length > 0) {
      const validExts = ['mp3', 'wav', 'aac', 'flac', 'm4a', 'ogg', 'wma', 'opus', 'ac3'];
      const valid = initialFiles.filter(p => validExts.includes(p.split('.').pop().toLowerCase()));
      addAjoinFilesBatch(valid);
    } else {
      renderAjoinTable();
    }

    document.getElementById('modal-audio-join')?.classList.remove('hidden');
  }

  function closeAudioJoinModal() {
    document.getElementById('modal-audio-join')?.classList.add('hidden');
  }

  async function promptAddAjoinFiles() {
    const b = I18N[currentLang] || I18N.ar;
    if (ajoinFiles.length >= 2) {
      alert(b.ajoin_warn_max_two || 'دامج الصوت يدمج ملفين صوتيين فقط. يمكنك حذف ملف لإضافة بديل.');
      return;
    }

    const filters = [{ name: 'Audio Files', extensions: ['mp3', 'wav', 'aac', 'm4a', 'flac', 'ogg', 'wma', 'opus', 'ac3'] }];
    const files = await window.api.selectFiles(filters);
    if (files && files.length > 0) {
      addAjoinFilesBatch(files);
    }
  }

  function addAjoinFilesBatch(filePaths) {
    const b = I18N[currentLang] || I18N.ar;
    for (const p of filePaths) {
      if (ajoinFiles.length >= 2) {
        alert(b.ajoin_warn_max_two || 'تم تحديد أول ملفين فقط؛ دامج الصوت يدمج ملفين صوتيين فقط');
        break;
      }
      if (!ajoinFiles.some(x => x.path === p)) {
        addAjoinFile(p);
      }
    }
    renderAjoinTable();
  }

  function addAjoinFile(filePath) {
    const fileRecord = {
      path: filePath,
      name: filePath.split(/[/\\]/).pop(),
      size: '...',
      duration: '--:--',
      bitrate: 'Default'
    };
    ajoinFiles.push(fileRecord);
    renderAjoinTable();

    if (window.api && window.api.getMediaInfo) {
      window.api.getMediaInfo(filePath).then(info => {
        if (!info) return;
        if (info.format) {
          if (info.format.size) fileRecord.size = formatBytes(parseInt(info.format.size));
          if (info.format.duration) fileRecord.duration = formatDuration(parseFloat(info.format.duration));
          if (info.format.bit_rate) fileRecord.bitrate = Math.round(parseInt(info.format.bit_rate) / 1000) + ' kbps';
        }
        renderAjoinTable();
      }).catch(() => {});
    }
  }

  function renderAjoinTable() {
    const emptyBox = document.getElementById('ajoin-empty-state');
    const tableWrapper = document.getElementById('ajoin-table-wrapper');
    const tbody = document.getElementById('ajoin-files-tbody');
    if (!emptyBox || !tableWrapper || !tbody) return;

    if (ajoinFiles.length === 0) {
      emptyBox.style.display = 'flex';
      tableWrapper.style.display = 'none';
      tbody.innerHTML = '';
      return;
    }

    emptyBox.style.display = 'none';
    tableWrapper.style.display = 'block';
    tbody.innerHTML = '';

    ajoinFiles.forEach((file, idx) => {
      const b = I18N[currentLang] || I18N.ar;
      const swapTip = b.ajoin_tip_swap || 'تبديل الترتيب بين الملفين';
      const delTip = b.tip_delete || 'حذف';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="text-align: center; font-weight: 700; color: #38bdf8;">#${idx + 1}</td>
        <td style="text-align: center; font-size: 18px;">🎵</td>
        <td style="font-weight: 500; max-width: 380px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${file.path}">
          <span style="color: var(--text-primary); font-weight: 600;">${file.name}</span>
          <div style="font-size: 11px; color: var(--text-muted);">${file.path}</div>
        </td>
        <td style="text-align: center; color: var(--text-secondary); font-size: 12px;">${file.duration}</td>
        <td style="text-align: center; color: var(--text-secondary); font-size: 12px;">${file.bitrate}</td>
        <td style="text-align: center; color: var(--text-secondary); font-size: 12px;">${file.size}</td>
        <td style="text-align: center; white-space: nowrap;">
          <button class="amix-row-btn" data-action="swap" title="${swapTip}" ${ajoinFiles.length !== 2 ? 'disabled' : ''}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="7 10 12 15 17 10"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          </button>
          <button class="amix-row-btn danger" data-action="del" data-idx="${idx}" title="${delTip}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </td>
      `;

      tr.querySelector('[data-action="swap"]')?.addEventListener('click', () => {
        if (ajoinFiles.length === 2) {
          const temp = ajoinFiles[0];
          ajoinFiles[0] = ajoinFiles[1];
          ajoinFiles[1] = temp;
          renderAjoinTable();
        }
      });

      tr.querySelector('[data-action="del"]')?.addEventListener('click', () => {
        ajoinFiles.splice(idx, 1);
        renderAjoinTable();
      });

      tbody.appendChild(tr);
    });
  }

  function confirmAudioJoinTask() {
    const b = I18N[currentLang] || I18N.ar;
    if (ajoinFiles.length !== 2) {
      alert(b.ajoin_warn_exact_two || 'دامج الصوت يتطلب إضافة ملفين صوتيين بالضبط (ملف أول وملف ثانٍ)');
      return;
    }

    const fmt = document.getElementById('ajoin-output-format')?.value || 'mp3';
    const intervals = parseFloat(document.getElementById('ajoin-intervals-select')?.value || '0');
    const taskTitle = b.ajoin_title || 'Audio Joiner';
    const presetName = document.getElementById('ajoin-preset-name')?.textContent || 'جودة عالية (320 ك.بت/ث)';

    addTask({
      type: 'a_merge',
      input: ajoinFiles.map(f => f.path),
      options: {
        intervals,
        outputExt: '.' + fmt,
        presetName,
        outputDir: settings.outputDir || 'D:\\FLoutput',
        ...(currentFormatOptions || {})
      },
      name: `${taskTitle} (${ajoinFiles[0].name} + ${ajoinFiles[1].name}) [${fmt.toUpperCase()}]`
    });

    closeAudioJoinModal();
  }

    // =========================================================
  function getMediaTypeForTool(toolType) {
    if (!toolType) return 'video';
    if (toolType.startsWith('v_')) return 'video';
    if (toolType.startsWith('a_')) return 'audio';
    if (toolType.startsWith('i_')) return 'picture';
    if (toolType === 'disc_iso_cso') return 'disc';
    return 'video';
  }

  function setupFormatTaskModals() {
    // Format Task Window Controls
    document.getElementById('ft-btn-close')?.addEventListener('click', closeFormatTaskModal);
    document.getElementById('ft-btn-output-setting')?.addEventListener('click', (e) => {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      openSettingModal();
    });
    document.getElementById('ft-preset-name')?.addEventListener('click', (e) => {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      openSettingModal();
    });
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

    // Multi-format dropdown listener (a_aac, v_avi)
    document.getElementById('ft-format-select')?.addEventListener('change', (e) => {
      const selectedFmt = e.target.value.toLowerCase();
      currentFormatOptions.outputExt = '.' + selectedFmt;
      if (currentMediaType === 'audio') {
        currentFormatOptions.audioEncode = selectedFmt.toUpperCase();
        setSelectVal('as-opt-audio-encode', selectedFmt.toUpperCase());
      }
      const titleEl = document.getElementById('ft-window-title');
      if (titleEl) {
        titleEl.textContent = `-> ${selectedFmt.toUpperCase()}`;
      }
    });

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
    document.getElementById('ps-chk-size-limit')?.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      const wInput = document.getElementById('ps-input-max-width');
      const hInput = document.getElementById('ps-input-max-height');
      const sel = document.getElementById('ps-preset-select');
      if (wInput) wInput.disabled = !isChecked;
      if (hInput) hInput.disabled = !isChecked;
      if (!isChecked) {
        if (sel) sel.value = 'original';
        currentPresetKey = 'original';
        currentPresetName = 'Original Size';
        if (wInput) wInput.value = 0;
        if (hInput) hInput.value = 0;
      } else {
        const curW = parseInt(wInput?.value || 0);
        const curH = parseInt(hInput?.value || 0);
        if (curW === 0 && curH === 0) {
          if (sel) sel.value = 'mw1024_mh768';
          onPicturePresetChange('mw1024_mh768');
        }
      }
    });
    document.getElementById('ps-preset-select')?.addEventListener('change', (e) => {
      onPicturePresetChange(e.target.value);
    });
    document.getElementById('ps-input-max-width')?.addEventListener('input', onPictureDimensionInput);
    document.getElementById('ps-input-max-height')?.addEventListener('input', onPictureDimensionInput);
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

  // ========== Presets Localization Map & Helpers ==========
  const PRESET_I18N_KEYS = {
    // Video
    optimum: 'preset_optimum',
    high_2pass: 'preset_high_2pass',
    high: 'preset_high',
    medium: 'preset_medium',
    low: 'preset_low',
    '4k': 'preset_4k',
    '2k': 'preset_2k',
    '720p': 'preset_720p',
    '480p': 'preset_480p',
    copy: 'preset_copy',
    custom: 'preset_custom',
    avc_high: 'preset_avc_high',
    hevc_high: 'preset_hevc_high',
    uhd_4k: 'preset_uhd_4k',
    qhd_2k: 'preset_qhd_2k',

    // Audio
    high: 'preset_audio_high',
    medium: 'preset_audio_medium',
    low: 'preset_audio_low',
    audio_high: 'preset_audio_high',
    audio_medium: 'preset_audio_medium',
    audio_low: 'preset_audio_low',
    vbr_0: 'preset_audio_vbr_0',
    vbr_high: 'preset_audio_vbr_high',
    vbr_2: 'preset_audio_vbr_2',
    vbr_medium: 'preset_audio_vbr_medium',
    vbr_4: 'preset_audio_vbr_4',
    vbr_low: 'preset_audio_vbr_low',

    // Picture
    original: 'preset_pic_original',
    mw2400_mh1800: 'preset_mw2400_mh1800',
    mw1024_mh768: 'preset_mw1024_mh768',
    mw640_mh480: 'preset_mw640_mh480',
    mw320_mh240: 'preset_mw320_mh240',
    mw176_mh144: 'preset_mw176_mh144',
    pic_custom: 'preset_pic_custom',

    // Disc
    cso_lvl5: 'preset_cso_lvl5',

  };

  function getPresetDisplayName(key, fallbackName) {
    const b = I18N[currentLang] || I18N.en;
    if (!key) return fallbackName || '';

    if (currentMediaType === 'audio') {
      const audioKey = 'audio_' + key;
      if (PRESET_I18N_KEYS[audioKey] && b[PRESET_I18N_KEYS[audioKey]]) {
        return b[PRESET_I18N_KEYS[audioKey]];
      }
    } else if (currentMediaType === 'picture' || currentMediaType === 'image') {
      if (key === 'custom' && b.preset_pic_custom) return b.preset_pic_custom;
    }

    const i18nKey = PRESET_I18N_KEYS[key];
    if (i18nKey && b[i18nKey]) {
      return b[i18nKey];
    }
    return fallbackName || key;
  }

  function updateCategoryBadge() {
    const badgeText = document.getElementById('ft-badge-text');
    if (!badgeText) return;
    const b = I18N[currentLang] || I18N.ar;
    if (currentFormatTool === 'disc_iso_cso') {
      badgeText.textContent = b.badge_iso_cso || 'ISO / CSO';
    } else if (currentMediaType === 'video') {
      badgeText.textContent = b.badge_video || (currentLang === 'ar' ? 'فيديو' : 'Video');
    } else if (currentMediaType === 'audio') {
      badgeText.textContent = b.badge_audio || (currentLang === 'ar' ? 'صوت' : 'Audio');
    } else if (currentMediaType === 'picture' || currentMediaType === 'image') {
      badgeText.textContent = b.badge_picture || (currentLang === 'ar' ? 'صورة' : 'Picture');
    } else if (currentMediaType === 'doc' || currentMediaType === 'document') {
      badgeText.textContent = b.badge_document || (currentLang === 'ar' ? 'وثيقة' : 'Document');
    } else {
      badgeText.textContent = b.badge_disc || (currentLang === 'ar' ? 'أسطوانة' : 'Disc');
    }
  }

  function updatePresetDropdownOptions() {
    const b = I18N[currentLang] || I18N.en;

    const vsSelect = document.getElementById('vs-preset-select');
    if (vsSelect && vsSelect.options) {
      Array.from(vsSelect.options).forEach(opt => {
        const val = opt.value;
        const key = PRESET_I18N_KEYS[val];
        if (key && b[key]) opt.textContent = b[key];
      });
    }

    const asSelect = document.getElementById('as-preset-select');
    if (asSelect && asSelect.options) {
      Array.from(asSelect.options).forEach(opt => {
        const val = opt.value;
        const audioKey = 'audio_' + val;
        const key = PRESET_I18N_KEYS[audioKey] || PRESET_I18N_KEYS[val];
        if (key && b[key]) opt.textContent = b[key];
      });
    }

    const psSelect = document.getElementById('ps-preset-select');
    if (psSelect && psSelect.options) {
      Array.from(psSelect.options).forEach(opt => {
        const val = opt.value;
        if (val === 'custom') {
          if (b.preset_pic_custom) opt.textContent = b.preset_pic_custom;
        } else {
          const key = PRESET_I18N_KEYS[val];
          if (key && b[key]) opt.textContent = b[key];
        }
      });
    }
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
        const b = I18N[currentLang] || I18N.ar;
        const localized = b[`t_${toolType}`];
        let displayName = localized || def.name || toolType.toUpperCase();
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
    updateCategoryBadge();
    const badgeIcon = document.getElementById('ft-badge-icon');
    const badgeBox = document.getElementById('ft-category-badge');
    const badgeText = document.getElementById('ft-badge-text');

    if (badgeText) {
      badgeText.style.color = '#ffffff';
      badgeText.style.display = 'block';
      badgeText.style.visibility = 'visible';
      badgeText.style.opacity = '1';
    }

    if (badgeBox) {
      if (toolType === 'disc_iso_cso') {
        badgeBox.style.borderColor = '#8b5cf6';
        badgeBox.style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.28), rgba(15, 23, 42, 0.95))';
        badgeBox.style.boxShadow = '0 0 16px rgba(139, 92, 246, 0.4)';
      } else if (currentMediaType === 'video') {
        badgeBox.style.borderColor = '#0284c7';
        badgeBox.style.background = 'linear-gradient(135deg, rgba(2, 132, 199, 0.28), rgba(15, 23, 42, 0.95))';
        badgeBox.style.boxShadow = '0 0 16px rgba(2, 132, 199, 0.4)';
      } else if (currentMediaType === 'audio') {
        badgeBox.style.borderColor = '#10b981';
        badgeBox.style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.28), rgba(15, 23, 42, 0.95))';
        badgeBox.style.boxShadow = '0 0 16px rgba(16, 185, 129, 0.4)';
      } else if (currentMediaType === 'picture' || currentMediaType === 'image') {
        badgeBox.style.borderColor = '#38bdf8';
        badgeBox.style.background = 'linear-gradient(135deg, rgba(56, 189, 248, 0.28), rgba(15, 23, 42, 0.95))';
        badgeBox.style.boxShadow = '0 0 16px rgba(56, 189, 248, 0.4)';
      } else if (currentMediaType === 'doc' || currentMediaType === 'document') {
        badgeBox.style.borderColor = '#ef4444';
        badgeBox.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.28), rgba(15, 23, 42, 0.95))';
        badgeBox.style.boxShadow = '0 0 16px rgba(239, 68, 68, 0.4)';
      } else {
        badgeBox.style.borderColor = '#8b5cf6';
        badgeBox.style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.28), rgba(15, 23, 42, 0.95))';
        badgeBox.style.boxShadow = '0 0 16px rgba(139, 92, 246, 0.4)';
      }
    }
    if (badgeIcon) {
      if (toolType === 'disc_iso_cso') {
        badgeIcon.innerHTML = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/></svg>`;
      } else if (currentMediaType === 'video') {
        badgeIcon.innerHTML = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="3" width="19" height="18" rx="2.5"/><line x1="7.5" y1="3" x2="7.5" y2="21"/><line x1="16.5" y1="3" x2="16.5" y2="21"/><line x1="2.5" y1="12" x2="21.5" y2="12"/></svg>`;
      } else if (currentMediaType === 'audio') {
        badgeIcon.innerHTML = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V6l12-2.5v12.5"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`;
      } else if (currentMediaType === 'picture' || currentMediaType === 'image') {
        badgeIcon.innerHTML = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3.5" width="18" height="17" rx="2.5"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10.5 5 20.5"/></svg>`;
      } else if (currentMediaType === 'doc' || currentMediaType === 'document') {
        badgeIcon.innerHTML = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`;
      } else {
        badgeIcon.innerHTML = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/></svg>`;
      }
    }

    // Initialize Default Presets & Options
    const qBtn = document.getElementById('ft-btn-quick-preset');
    if (toolType === 'disc_iso_cso') {
      currentPresetKey = 'cso_lvl5';
      currentPresetName = 'CSO Compress Level 5';
      currentFormatOptions = { csoCompressLevel: 5 };
      if (qBtn) qBtn.style.display = 'none';
    } else if (currentMediaType === 'video') {
      {
        currentPresetKey = 'optimum';
        currentPresetName = VIDEO_PRESETS.optimum.name;
        currentFormatOptions = { ...VIDEO_PRESETS.optimum };
        if (qBtn) qBtn.style.display = 'inline-flex';
      }
    } else if (currentMediaType === 'audio') {
      currentPresetKey = 'high';
      currentPresetName = AUDIO_PRESETS.high.name;
      currentFormatOptions = { ...AUDIO_PRESETS.high };
      if (qBtn) qBtn.style.display = 'inline-flex';
    } else {
      currentPresetKey = 'original';
      currentPresetName = PICTURE_PRESETS.original.name;
      currentFormatOptions = { ...PICTURE_PRESETS.original };
      if (qBtn) qBtn.style.display = 'inline-flex';
    }

    // Multi-format selector bar (for tools like a_aac and v_avi)
    const pickerWrap = document.getElementById('ft-format-picker-wrap');
    const pickerSelect = document.getElementById('ft-format-select');

    if (def.multiFormats && def.multiFormats.length > 0) {
      if (pickerWrap && pickerSelect) {
        pickerSelect.innerHTML = '';
        def.multiFormats.forEach(fmt => {
          const opt = document.createElement('option');
          opt.value = fmt.ext.replace(/^\./, '');
          opt.textContent = fmt.label;
          pickerSelect.appendChild(opt);
        });

        const defaultFormat = def.defaultExt ? def.defaultExt.replace(/^\./, '') : def.multiFormats[0].ext.replace(/^\./, '');
        pickerSelect.value = defaultFormat;
        pickerWrap.style.display = 'inline-flex';

        currentFormatOptions.outputExt = '.' + defaultFormat;
        if (currentMediaType === 'audio') {
          currentFormatOptions.audioEncode = defaultFormat.toUpperCase();
          setSelectVal('as-opt-audio-encode', defaultFormat.toUpperCase());
        }

        if (titleEl) {
          titleEl.textContent = `-> ${defaultFormat.toUpperCase()}`;
        }
      }
    } else {
      if (pickerWrap) pickerWrap.style.display = 'none';
      currentFormatOptions.outputExt = def.ext || '.mp4';
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
    const displayName = getPresetDisplayName(currentPresetKey, currentPresetName);
    const presetNameEl = document.getElementById('ft-preset-name');
    if (presetNameEl) presetNameEl.textContent = displayName;

    const amixPresetEl = document.getElementById('amix-preset-name');
    if (amixPresetEl) amixPresetEl.textContent = displayName;

    const ajoinPresetEl = document.getElementById('ajoin-preset-name');
    if (ajoinPresetEl) ajoinPresetEl.textContent = displayName;

    const appendLbl = document.getElementById('ft-lbl-append-name');
    if (appendLbl) {
      const b = I18N[currentLang] || I18N.en;
      const template = b.lbl_append_setting_name || 'Append setting name [{name}]';
      appendLbl.textContent = template.replace('{name}', displayName);
    }
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
      const isImg = currentMediaType === 'image' || currentMediaType === 'picture';
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

    const hasVideo = file.rawInfo?.streams?.some(s => s.codec_type === 'video') || /\.(mp4|mkv|webm|avi|mov|flv|wmv|ts|m4v|3gp)$/i.test(file.path);
    if (hasVideo) {
      if (vid) {
        vid.src = safeUrl;
        vid.style.display = 'block';
      }
      if (aud) aud.style.display = 'none';
      if (img) img.style.display = 'none';
    } else if (currentMediaType === 'audio' || /\.(mp3|wav|ogg|flac|m4a|aac|wma|opus)$/i.test(file.path)) {
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

  function openSettingModal(explicitType = null) {
    const validExplicit = (typeof explicitType === 'string' && explicitType) ? explicitType : null;
    const type = validExplicit || (currentFormatTool === 'a_mix' || currentFormatTool === 'a_merge' ? 'audio' : currentMediaType);
    if (type === 'audio') {
      currentMediaType = 'audio';
      populateAudioSettingsModal();
      document.getElementById('audio-setting-modal').classList.remove('hidden');
      return;
    }
    if (currentFormatTool === 'disc_iso_cso') {
      openCsoCompressModal();
      return;
    }
    if (type === 'video') {
      populateVideoSettingsModal();
      document.getElementById('video-setting-modal').classList.remove('hidden');
    } else if (type === 'image' || type === 'picture') {
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
    const titleEl = document.getElementById('ps-window-title');
    if (titleEl) {
      const def = TOOL_DEFS[currentFormatTool] || { name: (currentFormatTool || '').toUpperCase() };
      let displayName = def.name || 'PICTURE';
      if (!displayName.startsWith('->') && !displayName.startsWith('→')) {
        displayName = `-> ${displayName}`;
      }
      titleEl.textContent = displayName.replace('→', '->');
    }

    const sel = document.getElementById('ps-preset-select');
    const chkLimit = document.getElementById('ps-chk-size-limit');
    const w = document.getElementById('ps-input-max-width');
    const h = document.getElementById('ps-input-max-height');
    const opts = currentFormatOptions || {};

    const wVal = opts.maxWidth !== undefined ? opts.maxWidth : 0;
    const hVal = opts.maxHeight !== undefined ? opts.maxHeight : 0;
    const isLimit = !!opts.sizeLimit || (wVal > 0 || hVal > 0);

    if (w) {
      w.value = wVal;
      w.disabled = !isLimit;
    }
    if (h) {
      h.value = hVal;
      h.disabled = !isLimit;
    }
    if (chkLimit) {
      chkLimit.checked = isLimit;
    }

    let presetKey = currentPresetKey || (isLimit ? 'custom' : 'original');
    if (!PICTURE_PRESETS[presetKey]) presetKey = isLimit ? 'custom' : 'original';
    if (sel) sel.value = presetKey;
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
    const chkLimit = document.getElementById('ps-chk-size-limit');
    const wInput = document.getElementById('ps-input-max-width');
    const hInput = document.getElementById('ps-input-max-height');

    if (key === 'original') {
      currentPresetKey = 'original';
      currentPresetName = 'Original Size';
      if (chkLimit) chkLimit.checked = false;
      if (wInput) { wInput.value = 0; wInput.disabled = true; }
      if (hInput) { hInput.value = 0; hInput.disabled = true; }
      return;
    }

    if (chkLimit) chkLimit.checked = true;
    if (wInput) wInput.disabled = false;
    if (hInput) hInput.disabled = false;

    if (key === 'custom') {
      currentPresetKey = 'custom';
      currentPresetName = 'Custom Size';
      return;
    }
    const p = PICTURE_PRESETS[key];
    if (!p) return;
    currentPresetKey = key;
    currentPresetName = p.name;

    if (wInput) wInput.value = p.limitWidth || 0;
    if (hInput) hInput.value = p.limitHeight || 0;
  }

  function onPictureDimensionInput() {
    const w = parseInt(document.getElementById('ps-input-max-width')?.value) || 0;
    const h = parseInt(document.getElementById('ps-input-max-height')?.value) || 0;
    const chkLimit = document.getElementById('ps-chk-size-limit');
    if (w > 0 || h > 0) {
      if (chkLimit) chkLimit.checked = true;
    }
    let matched = null;
    for (const [k, p] of Object.entries(PICTURE_PRESETS)) {
      if (k !== 'custom' && (p.limitWidth || 0) === w && (p.limitHeight || 0) === h) {
        matched = k;
        break;
      }
    }
    const sel = document.getElementById('ps-preset-select');
    if (matched) {
      if (sel) sel.value = matched;
      currentPresetKey = matched;
      currentPresetName = PICTURE_PRESETS[matched].name;
    } else {
      if (sel) sel.value = 'custom';
      currentPresetKey = 'custom';
      currentPresetName = (w === 0 && h === 0) ? 'Original Size' : `Max Width ${w} Max Height ${h}`;
    }
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

    if (currentFormatOptions.audioEncode) {
      const code = currentFormatOptions.audioEncode.toLowerCase();
      const amixFmt = document.getElementById('amix-output-format');
      if (amixFmt && Array.from(amixFmt.options).some(o => o.value === code)) {
        amixFmt.value = code;
      }
      const ajoinFmt = document.getElementById('ajoin-output-format');
      if (ajoinFmt && Array.from(ajoinFmt.options).some(o => o.value === code)) {
        ajoinFmt.value = code;
      }
    }

    updatePresetDisplays();
    document.getElementById('audio-setting-modal').classList.add('hidden');
  }

  function applyPictureSettings() {
    const sel = document.getElementById('ps-preset-select');
    const chkLimit = document.getElementById('ps-chk-size-limit');
    currentPresetKey = sel ? sel.value : currentPresetKey;
    const isLimit = chkLimit ? chkLimit.checked : false;
    const w = isLimit ? (parseInt(document.getElementById('ps-input-max-width')?.value) || 0) : 0;
    const h = isLimit ? (parseInt(document.getElementById('ps-input-max-height')?.value) || 0) : 0;

    if (!isLimit || (w === 0 && h === 0)) {
      currentPresetName = 'Original Size';
      currentPresetKey = 'original';
    } else if (currentPresetKey !== 'custom' && PICTURE_PRESETS[currentPresetKey]) {
      currentPresetName = PICTURE_PRESETS[currentPresetKey].name;
    } else {
      currentPresetName = `Max Width ${w} Max Height ${h}`;
    }

    currentFormatOptions = {
      ...currentFormatOptions,
      sizeLimit: isLimit && (w > 0 || h > 0),
      maxWidth: w,
      maxHeight: h
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

  let currentMultiProfilesList = null;

  function updateMultiProfilesModalLanguage() {
    const modal = document.getElementById('multi-profiles-modal');
    if (modal && !modal.classList.contains('hidden') && currentMultiProfilesList) {
      renderMultiProfilesList(currentMultiProfilesList);
    }
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

    currentMultiProfilesList = profiles;
    renderMultiProfilesList(profiles);
    document.getElementById('multi-profiles-modal')?.classList.remove('hidden');
  }

  function closeMultiProfilesModal() {
    document.getElementById('multi-profiles-modal')?.classList.add('hidden');
  }

  function getProfileDocIconSvg(type, color) {
    const b = I18N[currentLang] || I18N.en;
    const label = type === 'video' ? (b.badge_video || 'Video') : (b.badge_audio || 'Audio');

    if (type === 'vbr') {
      return `<svg class="mp-doc-icon" width="26" height="30" viewBox="0 0 24 28" fill="none">
        <path d="M3 2a2 2 0 0 1 2-2h10l6 6v20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V2z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2"/>
        <path d="M15 0v6h6" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1"/>
        <path d="M8 15a2 2 0 1 0 2-2V8l5-1.5v4.5a2 2 0 1 0 2-2V5L8 7v8z" fill="${color}"/>
        <text x="12" y="24" font-size="5" font-weight="700" text-anchor="middle" fill="${color}">${label}</text>
      </svg>`;
    } else if (type === 'video') {
      return `<svg class="mp-doc-icon" width="26" height="30" viewBox="0 0 24 28" fill="none">
        <path d="M3 2a2 2 0 0 1 2-2h10l6 6v20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V2z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2"/>
        <path d="M15 0v6h6" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1"/>
        <rect x="6.5" y="8" width="11" height="8" rx="1.5" fill="${color}"/>
        <polygon points="10,10.2 14.5,12 10,13.8" fill="#ffffff"/>
        <text x="12" y="24" font-size="5" font-weight="700" text-anchor="middle" fill="${color}">${label}</text>
      </svg>`;
    } else {
      return `<svg class="mp-doc-icon" width="26" height="30" viewBox="0 0 24 28" fill="none">
        <path d="M3 2a2 2 0 0 1 2-2h10l6 6v20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V2z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2"/>
        <path d="M15 0v6h6" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1"/>
        <path d="M8 15a2 2 0 1 0 2-2V8l5-1.5v4.5a2 2 0 1 0 2-2V5L8 7v8z" fill="${color}"/>
        <text x="12" y="24" font-size="5" font-weight="700" text-anchor="middle" fill="${color}">${label}</text>
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
      const displayName = getPresetDisplayName(p.id, p.name);
      return `
        <div class="mp-profile-item ${isChecked ? 'selected' : ''}" data-id="${p.id}">
          <input type="checkbox" class="mp-item-chk" ${isChecked ? 'checked' : ''} data-id="${p.id}">
          <div class="mp-item-icon">${getProfileDocIconSvg(p.type, p.color)}</div>
          <div class="mp-item-info">
            <span class="mp-item-name">${displayName}</span>
          </div>
        </div>
      `;
    }).join('');

    updateSelectAllState();
  }

  function applyMultiProfiles() {
    const checkedChks = Array.from(document.querySelectorAll('.mp-item-chk:checked'));
    if (checkedChks.length === 0) {
      alert(currentLang === 'ar' ? 'يرجى تحديد قالب واحد على الأقل.' : 'Please select at least one profile.');
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

      const suffix = currentLang === 'ar' ? ` (+${checkedIds.length - 1} قوالب)` : ` (+${checkedIds.length - 1} Profiles)`;
      currentPresetName = `${firstName}${suffix}`;
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
          {
            presetOpts = VIDEO_PRESETS[pKey] || {};
            pName = presetOpts.name || pKey;
          }
        } else if (currentMediaType === 'picture') {
          presetOpts = PICTURE_PRESETS[pKey] || {};
          pName = presetOpts.name || pKey;
        } else if (currentFormatTool === 'disc_iso_cso') {
          pName = `CSO Level ${currentFormatOptions.csoCompressLevel || 5}`;
        }

        const isCsoInput = file.path.toLowerCase().endsWith('.cso');
        const outputExt = currentFormatTool === 'disc_iso_cso' ? (isCsoInput ? '.iso' : '.cso') : (currentFormatOptions.outputExt || def.ext || '.mp4');

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

        let displayName = getToolName(currentFormatTool);
        if (def.multiFormats && currentFormatOptions.outputExt) {
          displayName = `-> ${currentFormatOptions.outputExt.replace('.', '').toUpperCase()}`;
        }

        addTask({
          type: currentFormatTool,
          input: file.path,
          options: taskOptions,
          name: displayName + (profilesToCreate.length > 1 ? ` [${pName}]` : ''),
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
    d_pdf_decrypt: {
      icon: '🔓', ext: '.pdf', filters: [{ name: 'PDF Documents', extensions: ['pdf'] }],
      ar: { title: 'Decrypt PDF — فك تشفير وحماية PDF', sub: 'إزالة كلمات المرور والقيود من ملفات الـ PDF المحمية' },
      en: { title: 'Decrypt PDF — Unlock Protected PDF', sub: 'Remove passwords and permissions restrictions from protected PDF files' },
      fr: { title: 'Déverrouiller PDF — Retirer la protection', sub: 'Supprimer les mots de passe et restrictions des fichiers PDF' },
      es: { title: 'Descifrar PDF — Desbloquear PDF', sub: 'Eliminar contraseñas y restricciones de archivos PDF protegidos' },
      tr: { title: 'PDF Şifresi Çöz — PDF Kilidini Aç', sub: 'Korumalı PDF dosyalarından parolaları ve izin kısıtlamalarını kaldırın' },
    },
    d_pdf_encrypt: {
      icon: '🔒', ext: '.pdf', filters: [{ name: 'PDF Documents', extensions: ['pdf'] }],
      ar: { title: 'Encrypt PDF — تشفير وحماية PDF', sub: 'تأمين مستندات الـ PDF بكلمة مرور وتشفير قوي لمنع النسخ أو التعديل' },
      en: { title: 'Encrypt PDF — Protect & Secure PDF', sub: 'Secure PDF files with strong password encryption and permission controls' },
      fr: { title: 'Chiffrer PDF — Protéger par mot de passe', sub: 'Sécuriser vos PDF avec mot de passe et restriction de copie' },
      es: { title: 'Cifrar PDF — Proteger con contraseña', sub: 'Asegurar documentos PDF con cifrado de contraseña y control de permisos' },
      tr: { title: 'PDF Şifrele — PDF Güvenliği', sub: 'PDF dosyalarınızı güçlü şifreleme ve izin kontrolleriyle koruyun' },
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
    document.getElementById('doc-center-add-files')?.addEventListener('click', promptAddFilesToDocTask);
    document.getElementById('doc-empty-add-btn')?.addEventListener('click', promptAddFilesToDocTask);

    document.getElementById('doc-btn-move-up')?.addEventListener('click', () => moveSelectedDocFile(-1));
    document.getElementById('doc-btn-move-down')?.addEventListener('click', () => moveSelectedDocFile(1));
    document.getElementById('doc-btn-remove')?.addEventListener('click', removeSelectedDocFile);
    document.getElementById('doc-btn-clear')?.addEventListener('click', clearDocFiles);

    // Subtabs
    document.getElementById('doc-tab-files')?.addEventListener('click', () => switchDocSubtab('files'));
    document.getElementById('doc-tab-preview')?.addEventListener('click', () => switchDocSubtab('preview'));
    document.getElementById('doc-tab-mediainfo')?.addEventListener('click', () => switchDocSubtab('mediainfo'));

    // Checkbox select all
    document.getElementById('doc-chk-select-all')?.addEventListener('change', (e) => {
      const chk = e.target.checked;
      document.querySelectorAll('.doc-row-chk').forEach(c => c.checked = chk);
    });

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

  function switchDocSubtab(tabName) {
    ['files', 'preview', 'mediainfo'].forEach(t => {
      const btn = document.getElementById(`doc-tab-${t}`);
      const view = document.getElementById(`doc-view-${t}`);
      if (t === tabName) {
        btn?.classList.add('active');
        view?.classList.remove('hidden');
        view?.classList.add('active');
      } else {
        btn?.classList.remove('active');
        view?.classList.add('hidden');
        view?.classList.remove('active');
      }
    });

    if (tabName === 'preview') {
      updateDocPreview();
    } else if (tabName === 'mediainfo') {
      updateDocMediaInfo();
    }
  }

  function updateDocPreview() {
    const box = document.getElementById('doc-preview-box');
    if (!box) return;
    const b = I18N[currentLang] || I18N.ar;
    if (selectedDocFileIndex >= 0 && docTaskFiles[selectedDocFileIndex]) {
      const file = docTaskFiles[selectedDocFileIndex];
      box.innerHTML = `
        <div style="padding: 20px; background: rgba(255,255,255,0.03); border-radius: 8px; border: 1px solid var(--border-subtle); max-width: 600px; margin: 0 auto; text-align: left; direction: ltr;">
          <div style="font-size: 28px; margin-bottom: 12px; text-align: center;">📄</div>
          <div style="font-weight: 700; font-size: 15px; color: #f8fafc; margin-bottom: 8px; word-break: break-all;">${file.name}</div>
          <div style="font-size: 12.5px; color: #94a3b8; margin-bottom: 4px;">Path: <span style="color: #cbd5e1;">${file.path}</span></div>
          <div style="font-size: 12.5px; color: #94a3b8; margin-bottom: 4px;">Size: <span style="color: #cbd5e1;">${file.size}</span></div>
          <div style="font-size: 12.5px; color: #94a3b8;">Target Tool: <span style="color: #38bdf8;">${currentDocTool || 'Document Conversion'}</span></div>
        </div>
      `;
    } else {
      box.innerHTML = `<p style="color:var(--text-muted);font-size:13px;">${b.doc_preview_hint || 'اختر ملفاً من القائمة لمعاينته هنا'}</p>`;
    }
  }

  function updateDocMediaInfo() {
    const box = document.getElementById('doc-mediainfo-box');
    if (!box) return;
    const b = I18N[currentLang] || I18N.ar;
    if (selectedDocFileIndex >= 0 && docTaskFiles[selectedDocFileIndex]) {
      const file = docTaskFiles[selectedDocFileIndex];
      const ext = file.name.split('.').pop().toUpperCase();
      box.innerHTML = `
        <div style="padding: 16px 24px; text-align: left; direction: ltr; font-family: monospace; font-size: 13px; line-height: 1.8; color: #cbd5e1;">
          <div style="color: #38bdf8; font-weight: bold; margin-bottom: 8px;">=== Document Metadata ===</div>
          <div>File Name    : ${file.name}</div>
          <div>File Extension: ${ext}</div>
          <div>Full Path    : ${file.path}</div>
          <div>Size Estimate: ${file.size}</div>
          <div>Status       : ${file.status}</div>
          <div style="margin-top: 8px; color: #10b981;">✓ Ready for conversion engine</div>
        </div>
      `;
    } else {
      box.innerHTML = `<p style="color:var(--text-muted);text-align:center;padding:24px;">${b.doc_info_hint || 'حدد ملفاً لعرض تفاصيل التنسيق ومعدل الضغط والصفحات...'}</p>`;
    }
  }

  function openDocumentTaskModal(toolType) {
    currentDocTool = toolType;
    docTaskFiles = [];
    selectedDocFileIndex = -1;

    const modal = document.getElementById('document-task-modal');
    const outInput = document.getElementById('doc-output-dir-input');

    if (outInput) outInput.value = settings.outputDir || 'D:\\FLoutput';

    switchDocSubtab('files');
    updateDocModalLanguage();
    renderDocFilesTable();

    modal.classList.remove('hidden');
  }

  function updateDocModalLanguage() {
    if (!currentDocTool) return;
    const b = I18N[currentLang] || I18N.ar;
    const meta = getDocMeta(currentDocTool, currentLang);
    const titleEl = document.getElementById('doc-window-title');
    const subtitleEl = document.getElementById('doc-tool-subtitle');
    const iconEl = document.getElementById('doc-window-icon');
    const badgeTextEl = document.getElementById('doc-badge-text');
    const badgeBox = document.getElementById('doc-category-badge');

    if (badgeBox) {
      badgeBox.style.borderColor = '#ef4444';
      badgeBox.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.28), rgba(15, 23, 42, 0.95))';
      badgeBox.style.boxShadow = '0 0 16px rgba(239, 68, 68, 0.4)';
    }
    if (titleEl) titleEl.innerHTML = `<bdi>${meta.title}</bdi>`;
    if (subtitleEl) subtitleEl.innerHTML = `<bdi>${meta.sub}</bdi>`;
    if (iconEl) iconEl.textContent = meta.icon;
    if (badgeTextEl) {
      badgeTextEl.style.color = '#ffffff';
      badgeTextEl.style.display = 'block';
      badgeTextEl.style.visibility = 'visible';
      badgeTextEl.style.opacity = '1';
      badgeTextEl.textContent = b.badge_document || (currentLang === 'ar' ? 'وثيقة' : 'Document');
    }

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
    const emptyState = document.getElementById('doc-empty-state');
    const tableContainer = document.getElementById('doc-table-container');
    const tbody = document.getElementById('doc-files-tbody');
    if (!tbody) return;
    const b = I18N[currentLang] || I18N.ar;

    if (docTaskFiles.length === 0) {
      if (emptyState) emptyState.classList.remove('hidden');
      if (tableContainer) tableContainer.classList.add('hidden');
      tbody.innerHTML = `
        <tr class="empty-row">
          <td colspan="6" style="text-align: center; padding: 28px 16px; border: none; background: transparent;">
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
                <span class="big-add-label">${b.btn_add_files || 'Add Files'}</span>
              </div>
              <span class="ft-drag-hint">${b.doc_empty_hint || 'Drag files here or click Add Files'}</span>
            </div>
          </td>
        </tr>
      `;
      document.getElementById('doc-empty-add-btn')?.addEventListener('click', promptAddFilesToDocTask);
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');
    if (tableContainer) tableContainer.classList.remove('hidden');

    tbody.innerHTML = docTaskFiles.map((f, idx) => `
      <tr class="${idx === selectedDocFileIndex ? 'selected' : ''}" data-index="${idx}">
        <td style="text-align:center;"><input type="checkbox" class="doc-row-chk" checked></td>
        <td style="text-align:center; color:var(--text-muted);">${idx + 1}</td>
        <td style="font-weight:600; color:var(--text-primary);">
          <div style="display:flex; align-items:center; gap:8px;">
            <span>📄</span>
            <span style="direction:ltr; text-align:left;">${f.name}</span>
          </div>
        </td>
        <td style="text-align:center; color:var(--text-secondary);">${f.size}</td>
        <td style="text-align:center;"><span class="status-badge queued">${f.status}</span></td>
        <td style="text-align:center;">
          <button class="ft-cell-btn btn-del-doc-file" data-index="${idx}" title="${b.tb_remove || 'Remove'}">✕</button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('tr').forEach(row => {
      row.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-del-doc-file') || e.target.classList.contains('doc-row-chk')) return;
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
    const b = I18N[currentLang] || I18N.ar;
    if (docTaskFiles.length === 0) {
      alert(b.alert_no_files || 'الرجاء إضافة ملف واحد على الأقل للمتابعة');
      return;
    }

    const outputDir = document.getElementById('doc-output-dir-input')?.value || settings.outputDir || 'D:\\FLoutput';
    const def = TOOL_DEFS[currentDocTool] || { name: 'Document', ext: '.pdf' };

    const options = {
      outputDir,
      outputExt: def.ext || '.pdf'
    };

    if (currentDocTool === 'd_pdf_join' || currentDocTool === 'd_pic_pdf' || currentDocTool === 'd_ffzip') {
      const filesSuffix = b.lbl_files || (currentLang === 'ar' ? 'ملفات' : 'files');
      addTask({
        type: currentDocTool,
        input: docTaskFiles.map(f => f.path),
        options,
        name: `${getToolName(currentDocTool)} (${docTaskFiles.length} ${filesSuffix})`,
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
    const b = I18N[currentLang] || I18N.ar;
    const meta = getDiscMeta(currentDiscTool, currentLang);
    const titleEl = document.getElementById('disc-window-title');
    const subtitleEl = document.getElementById('disc-tool-subtitle');
    const iconEl = document.getElementById('disc-window-icon');
    const badgeTextEl = document.getElementById('disc-badge-text');
    const badgeBox = document.getElementById('disc-category-badge');

    if (badgeBox) {
      badgeBox.style.borderColor = '#8b5cf6';
      badgeBox.style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.28), rgba(15, 23, 42, 0.95))';
      badgeBox.style.boxShadow = '0 0 16px rgba(139, 92, 246, 0.4)';
    }

    if (titleEl) titleEl.innerHTML = `<bdi>${meta.title}</bdi>`;
    if (subtitleEl) subtitleEl.innerHTML = `<bdi>${meta.sub}</bdi>`;
    if (iconEl) iconEl.textContent = meta.icon;
    if (badgeTextEl) {
      badgeTextEl.style.color = '#ffffff';
      badgeTextEl.style.display = 'block';
      badgeTextEl.style.visibility = 'visible';
      badgeTextEl.style.opacity = '1';
      badgeTextEl.textContent = b.badge_disc || (currentLang === 'ar' ? 'أسطوانة' : 'ROM / Disc');
    }

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
