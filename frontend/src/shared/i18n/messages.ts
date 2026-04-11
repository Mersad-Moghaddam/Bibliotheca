export type Locale = 'en' | 'fa'

export const messages = {
  en: {
    common: {
      appName: 'Libro',
      search: 'Search',
      details: 'Details',
      save: 'Save',
      cancel: 'Cancel',
      confirm: 'Confirm',
      loading: 'Loading...',
      darkMode: 'Dark mode',
      lightMode: 'Light mode'
    },
    nav: {
      dashboard: 'Dashboard',
      library: 'Library',
      reading: 'Reading',
      finished: 'Finished',
      nextToRead: 'Next To Read',
      wishlist: 'Wishlist',
      profile: 'Profile',
      signOut: 'Sign out',
      workspace: 'Workspace',
      readingFlow: 'Reading flow',
      account: 'Account',
      platformTitle: 'Libro platform',
      platformSubtitle: 'Focused reading operations for your personal workspace.',
      focusMode: 'Focus mode'
    },
    landing: {
      eyebrow: 'Reading intelligence, without clutter',
      title: 'Design a reading system you can sustain all year.',
      subtitle:
        'Libro combines a calm reading workflow with practical analytics, reminders, and insights so you can finish more of what matters.',
      ctaPrimary: 'Start for free',
      ctaSecondary: 'Log in',
      productPreview: 'Product preview',
      previewCard1Title: 'Weekly consistency',
      previewCard1Value: '+18%',
      previewCard2Title: 'Live progress across active titles',
      previewCard3: 'Get smart nudges based on your real reading behavior.',
      valueCards: [
        {
          title: 'Clarity-first workspace',
          text: 'Keep your library, current queue, and finish line in one structured flow.'
        },
        {
          title: 'Progress you can trust',
          text: 'Track pages and completion without noisy dashboards or vanity metrics.'
        },
        {
          title: 'Intentional momentum',
          text: 'Use reminders and insights to keep your reading habit active each week.'
        }
      ],
      workflowTitle: 'Capture → organize → read → reflect → finish → plan next',
      workflowSteps: [
        'Capture titles quickly',
        'Organize by status',
        'Read with focus',
        'Reflect on pace',
        'Finish with context',
        'Plan your next title'
      ],
      analyticsTitle: 'Reading analytics that stay practical',
      analyticsText:
        'A few high-signal metrics highlight your consistency, pace, and backlog health.',
      analyticsMetrics: [
        { label: 'Completion rate', value: '64%' },
        { label: 'Pages tracked', value: '1,240' },
        { label: 'Active titles', value: '3' },
        { label: 'Weekly streak', value: '4 weeks' }
      ],
      useCasesTitle: 'Built for intentional readers',
      useCases: [
        'Students building study discipline',
        'Deep readers balancing multiple topics',
        'Knowledge workers reading for leverage',
        'Book collectors curating queues',
        'Anyone building a durable reading habit'
      ],
      trustTitle: 'Reader feedback (early access)',
      testimonials: [
        {
          quote: 'Libro made my reading queue finally feel manageable.',
          author: 'Product designer'
        },
        {
          quote: 'The weekly momentum cues are simple and actually useful.',
          author: 'Graduate student'
        },
        {
          quote: 'I can see what to finish next without thinking too hard.',
          author: 'Operations lead'
        }
      ],
      faqTitle: 'FAQ',
      faq: [
        {
          q: 'Can I use Libro for personal reading only?',
          a: 'Yes. Libro is built for personal reading systems and can scale with your habit.'
        },
        {
          q: 'Are reminders real notifications?',
          a: 'Today, reminders are saved as preferences and surfaced in-app, with notification infrastructure ready for expansion.'
        },
        {
          q: 'Does Libro support Persian?',
          a: 'Yes. English and Persian are fully supported, including RTL behavior.'
        }
      ],
      finalCtaTitle: 'Build a calmer, smarter reading routine',
      finalCtaSubtitle: 'Set up your workspace in minutes and keep momentum week after week.',
      footerTagline: 'A focused workspace for modern readers.',
      footerRights: '© Libro. All rights reserved.'
    },
    auth: {
      createAccount: 'Create your account',
      welcomeBack: 'Welcome back',
      name: 'Name',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm password',
      signUp: 'Sign up',
      logIn: 'Log in',
      registerSubtitle: 'Create a calm reading home for your books, notes, and momentum.',
      loginSubtitle: 'Continue where you left off and return to your current reading flow.',
      hasAccount: 'Already have an account?',
      needAccount: 'Need an account?',
      registrationFailed: 'Registration failed. Please check your details.',
      invalidCredentials: 'Invalid credentials. Please try again.',
      emailAlreadyExists: 'An account with this email already exists.',
      missingFields: 'Please complete all required fields correctly.',
      networkFailure: 'Network error. Please check your connection and try again.',
      unexpectedServerError: 'Unexpected server error. Please try again.'
    },
    dashboard: {
      title: 'Dashboard',
      description: 'Track momentum across your reading workflow and quickly resume what matters.',
      analyticsTitle: 'Reading analytics',
      intelligenceTitle: 'Reading intelligence',
      totalPagesRead: 'Pages read',
      completionRate: 'Completion rate',
      readingPace: 'Books / month',
      currentStreak: 'Weekly streak',
      reminderOn: 'Reminder is on at {time}.',
      reminderOff: 'Reminder is currently off.',
      logSession: 'Log quick session',
      noInsights: 'Insights will appear as you read and update progress.',
      sessionsCount: '{count} recent sessions',
      emptyAnalyticsTitle: 'No analytics yet',
      emptyAnalyticsDescription: 'Add books and track progress to unlock reading analytics.',
      consistency: 'Consistency',
      goalsTitle: 'Reading goals',
      goalSummary: 'Pages {pagesRead}/{pagesGoal} · Books {booksRead}/{booksGoal}',
      periodWeekly: 'Weekly goal',
      periodMonthly: 'Monthly goal',
      setWeekly: 'Set weekly',
      setMonthly: 'Set monthly',
      currentSnapshot: 'Current reading snapshot',
      noActiveTitle: 'No active books yet',
      noActiveDescription: 'Move a title to Currently Reading to start seeing your progress here.',
      goLibrary: 'Go to library',
      needsAttention: 'Needs attention',
      tidyTitle: 'Everything is tidy',
      tidyDescription: 'No pending books right now—great reading flow.'
    },
    library: {
      title: 'Library',
      description: 'Keep every title organized and route books into your reading pipeline.',
      addBook: 'Add a new book',
      titlePlaceholder: 'Title',
      authorPlaceholder: 'Author',
      totalPages: 'Total pages',
      add: 'Add book',
      coverUrlOptional: 'Cover URL (optional)',
      genreOptional: 'Genre (optional)',
      isbnOptional: 'ISBN (optional)',
      showForm: 'Show form',
      hideForm: 'Hide form',
      added: 'Book added to your library.',
      searchPlaceholder: 'Search title or author',
      genre: 'Genre',
      sortRecent: 'Recently updated',
      sortTitle: 'Title',
      allStatuses: 'All statuses',
      noBooksTitle: 'No books found',
      noBooksDescription: 'Start by adding your first book above, or adjust your search filters.',
      clearFilters: 'Clear filters',
      deleteConfirm: 'Are you sure you want to delete this book?',
      deleteSuccess: 'Book deleted successfully.',
      deleteError: 'Could not delete this book.',
      deleting: 'Deleting...'
    },
    wishlist: {
      title: 'Wishlist',
      description: 'Collect future purchases and keep reliable links in one organized place.',
      addTitle: 'Add to wishlist',
      expectedPrice: 'Expected price',
      notes: 'Short note',
      addAction: 'Add to wishlist',
      emptyTitle: 'Wishlist is empty',
      emptyDescription: 'Save books you may want to buy or read next.',
      linkLabel: 'Optional store label',
      urlPlaceholder: 'https://example.com/book'
    },
    profile: {
      title: 'Profile',
      description: 'Manage account details and security settings.',
      updateName: 'Update name',
      newName: 'New name',
      updateNameAction: 'Update name',
      nameSuccess: 'Name updated successfully.',
      updatePassword: 'Update password',
      currentPassword: 'Current password',
      newPassword: 'New password',
      updatePasswordAction: 'Update password',
      passwordSuccess: 'Password updated successfully.',
      reminders: 'Reading reminders',
      reminderEnabled: 'Enable reminders',
      daily: 'Daily',
      weekdays: 'Weekdays',
      weekends: 'Weekends',
      weekly: 'Weekly',
      saveReminders: 'Save reminder settings',
      reminderSuccess: 'Reminder settings updated.',
      notesTitle: 'Personal notes',
      notesPlaceholder: 'Optional personal reading notes...'
    },
    status: {
      inLibrary: 'In library',
      currentlyReading: 'Currently reading',
      finished: 'Finished',
      nextToRead: 'Next to read'
    },
    books: {
      reading: 'Currently Reading',
      readingDesc: 'Track active books and update progress with minimal friction.',
      finished: 'Finished',
      finishedDesc: 'Review books you completed and celebrate steady progress.',
      nextToRead: 'Next To Read',
      nextToReadDesc: 'Curate your upcoming queue and start your next title quickly.',
      updateProgress: 'Update progress',
      markFinished: 'Mark finished',
      startReading: 'Start reading',
      actions: 'Book actions',
      moveTo: 'Move to',
      readingProgress: 'Reading progress',
      completed: 'Completed',
      notFinished: 'Not finished yet',
      delete: 'Delete book',
      collection: 'Reading collection',
      emptyTitle: 'No books found',
      emptyDescription: 'Move books from your library to continue.',
      notesTitle: 'Notes & highlights',
      notePlaceholder: 'Your note',
      highlightPlaceholder: 'Optional quote/highlight',
      saveNote: 'Save note',
      notesEmpty: 'No notes yet. Capture your first thought from this book.'
    },
    query: {
      errorTitle: 'Something went wrong',
      errorDescription: 'We could not load this section.',
      retry: 'Retry'
    }
  },
  fa: {
    common: {
      appName: 'لیبرو',
      search: 'جستجو',
      details: 'جزئیات',
      save: 'ذخیره',
      cancel: 'لغو',
      confirm: 'تایید',
      loading: 'در حال بارگذاری...',
      darkMode: 'حالت تیره',
      lightMode: 'حالت روشن'
    },
    nav: {
      dashboard: 'داشبورد',
      library: 'کتابخانه',
      reading: 'در حال مطالعه',
      finished: 'تمام‌شده',
      nextToRead: 'بعدی برای مطالعه',
      wishlist: 'لیست خرید',
      profile: 'پروفایل',
      signOut: 'خروج',
      workspace: 'فضای کار',
      readingFlow: 'جریان مطالعه',
      account: 'حساب کاربری',
      platformTitle: 'پلتفرم لیبرو',
      platformSubtitle: 'مدیریت متمرکز مطالعه برای فضای شخصی شما.',
      focusMode: 'حالت تمرکز'
    },
    landing: {
      eyebrow: 'هوشمندی مطالعه، بدون شلوغی',
      title: 'یک سیستم مطالعه پایدار برای تمام سال بساز.',
      subtitle:
        'لیبرو جریان مطالعه آرام، تحلیل کاربردی، یادآور و بینش رفتاری را در یک تجربه یکپارچه ترکیب می‌کند.',
      ctaPrimary: 'شروع رایگان',
      ctaSecondary: 'ورود',
      productPreview: 'پیش‌نمایش محصول',
      previewCard1Title: 'ثبات هفتگی',
      previewCard1Value: '+۱۸٪',
      previewCard2Title: 'پیشرفت زنده در کتاب‌های فعال',
      previewCard3: 'یادآورهای هوشمند بر اساس رفتار واقعی مطالعه شما.',
      valueCards: [
        {
          title: 'فضای کاری شفاف',
          text: 'کتابخانه، صف فعلی و خط پایان را در یک جریان منظم نگه دارید.'
        },
        {
          title: 'پیشرفت قابل اعتماد',
          text: 'بدون نمودارهای شلوغ، صفحات و تکمیل را دقیق دنبال کنید.'
        },
        {
          title: 'شتاب هدفمند',
          text: 'با یادآورها و بینش‌ها عادت مطالعه هفتگی را پایدار نگه دارید.'
        }
      ],
      workflowTitle: 'ثبت → سازماندهی → مطالعه → بازنگری → اتمام → برنامه بعدی',
      workflowSteps: [
        'ثبت سریع کتاب',
        'سازماندهی بر اساس وضعیت',
        'مطالعه متمرکز',
        'بازنگری سرعت',
        'اتمام با زمینه',
        'برنامه برای کتاب بعدی'
      ],
      analyticsTitle: 'تحلیل‌هایی که واقعاً کاربردی هستند',
      analyticsText: 'چند شاخص مهم، ثبات، سرعت و وضعیت صف شما را شفاف می‌کنند.',
      analyticsMetrics: [
        { label: 'نرخ تکمیل', value: '۶۴٪' },
        { label: 'صفحات ثبت‌شده', value: '۱۲۴۰' },
        { label: 'کتاب فعال', value: '۳' },
        { label: 'رشته هفتگی', value: '۴ هفته' }
      ],
      useCasesTitle: 'مناسب برای خوانندگان هدفمند',
      useCases: [
        'دانشجویان برای نظم مطالعه',
        'خوانندگان عمیق با موضوعات متعدد',
        'دانش‌ورزان برای رشد حرفه‌ای',
        'کتاب‌دوستان برای مدیریت صف',
        'هرکسی که عادت مطالعه پایدار می‌خواهد'
      ],
      trustTitle: 'بازخورد کاربران (نسخه اولیه)',
      testimonials: [
        { quote: 'لیبرو صف مطالعه من را واقعاً قابل مدیریت کرد.', author: 'طراح محصول' },
        {
          quote: 'نشانه‌های هفتگی ساده‌اند و واقعاً کمک می‌کنند.',
          author: 'دانشجوی تحصیلات تکمیلی'
        },
        { quote: 'خیلی سریع می‌فهمم کدام کتاب را باید تمام کنم.', author: 'مدیر عملیات' }
      ],
      faqTitle: 'سوالات متداول',
      faq: [
        {
          q: 'آیا لیبرو برای استفاده شخصی مناسب است؟',
          a: 'بله، لیبرو برای سیستم مطالعه شخصی طراحی شده و با عادت شما رشد می‌کند.'
        },
        {
          q: 'یادآورها اعلان واقعی هستند؟',
          a: 'در حال حاضر تنظیمات یادآور در محصول ذخیره می‌شوند و زیرساخت اعلان برای توسعه بعدی آماده است.'
        },
        {
          q: 'آیا پشتیبانی فارسی کامل است؟',
          a: 'بله، انگلیسی و فارسی با رفتار RTL پشتیبانی کامل دارند.'
        }
      ],
      finalCtaTitle: 'یک روتین مطالعه آرام و هوشمند بساز',
      finalCtaSubtitle: 'در چند دقیقه فضای کاری‌ات را بساز و هر هفته شتابت را حفظ کن.',
      footerTagline: 'فضای کاری متمرکز برای خوانندگان مدرن.',
      footerRights: '© لیبرو. تمام حقوق محفوظ است.'
    },
    auth: {
      createAccount: 'ایجاد حساب کاربری',
      welcomeBack: 'خوش آمدید',
      name: 'نام',
      email: 'ایمیل',
      password: 'رمز عبور',
      confirmPassword: 'تکرار رمز عبور',
      signUp: 'ثبت‌نام',
      logIn: 'ورود',
      registerSubtitle: 'برای کتاب‌ها، یادداشت‌ها و پیشرفت مطالعه‌ات یک فضای آرام بساز.',
      loginSubtitle: 'به جریان مطالعه‌ات برگرد و از همان‌جا ادامه بده.',
      hasAccount: 'حساب دارید؟',
      needAccount: 'حساب ندارید؟',
      registrationFailed: 'ثبت‌نام ناموفق بود. اطلاعات را بررسی کنید.',
      invalidCredentials: 'اطلاعات ورود نامعتبر است.',
      emailAlreadyExists: 'حسابی با این ایمیل از قبل وجود دارد.',
      missingFields: 'لطفاً تمام فیلدهای ضروری را به‌درستی تکمیل کنید.',
      networkFailure: 'خطای شبکه. اتصال خود را بررسی کرده و دوباره تلاش کنید.',
      unexpectedServerError: 'خطای غیرمنتظره سرور. دوباره تلاش کنید.'
    },
    dashboard: {
      title: 'داشبورد',
      description: 'روند مطالعه را دنبال کنید و سریع به مهم‌ترین مورد برگردید.',
      analyticsTitle: 'تحلیل مطالعه',
      intelligenceTitle: 'بینش مطالعه',
      totalPagesRead: 'صفحات خوانده‌شده',
      completionRate: 'نرخ تکمیل',
      readingPace: 'کتاب در ماه',
      currentStreak: 'رشته هفتگی',
      reminderOn: 'یادآور در ساعت {time} فعال است.',
      reminderOff: 'یادآور غیرفعال است.',
      logSession: 'ثبت جلسه کوتاه',
      noInsights: 'با ثبت پیشرفت، بینش‌های شخصی اینجا نمایش داده می‌شود.',
      sessionsCount: '{count} جلسه اخیر',
      emptyAnalyticsTitle: 'هنوز تحلیلی ندارید',
      emptyAnalyticsDescription: 'با افزودن کتاب و ثبت پیشرفت، تحلیل‌ها فعال می‌شوند.',
      consistency: 'ثبات مطالعه',
      goalsTitle: 'اهداف مطالعه',
      goalSummary: 'صفحه {pagesRead}/{pagesGoal} · کتاب {booksRead}/{booksGoal}',
      periodWeekly: 'هدف هفتگی',
      periodMonthly: 'هدف ماهانه',
      setWeekly: 'هدف هفتگی',
      setMonthly: 'هدف ماهانه',
      currentSnapshot: 'وضعیت مطالعه فعلی',
      noActiveTitle: 'کتاب فعالی ندارید',
      noActiveDescription: 'یک کتاب را به در حال مطالعه منتقل کنید.',
      goLibrary: 'رفتن به کتابخانه',
      needsAttention: 'نیازمند توجه',
      tidyTitle: 'همه چیز مرتب است',
      tidyDescription: 'فعلاً موردی در انتظار نیست.'
    },
    library: {
      title: 'کتابخانه',
      description: 'همه کتاب‌ها را منظم نگه دارید و آن‌ها را در جریان مطالعه قرار دهید.',
      addBook: 'افزودن کتاب جدید',
      titlePlaceholder: 'عنوان',
      authorPlaceholder: 'نویسنده',
      totalPages: 'تعداد صفحات',
      add: 'افزودن کتاب',
      coverUrlOptional: 'آدرس جلد (اختیاری)',
      genreOptional: 'ژانر (اختیاری)',
      isbnOptional: 'شابک (اختیاری)',
      showForm: 'نمایش فرم',
      hideForm: 'بستن فرم',
      added: 'کتاب به کتابخانه اضافه شد.',
      searchPlaceholder: 'جستجوی عنوان یا نویسنده',
      genre: 'ژانر',
      sortRecent: 'آخرین به‌روزرسانی',
      sortTitle: 'عنوان',
      allStatuses: 'همه وضعیت‌ها',
      noBooksTitle: 'کتابی پیدا نشد',
      noBooksDescription: 'یک کتاب اضافه کنید یا فیلترها را تغییر دهید.',
      clearFilters: 'پاک‌کردن فیلترها',
      deleteConfirm: 'آیا از حذف این کتاب مطمئن هستید؟',
      deleteSuccess: 'کتاب با موفقیت حذف شد.',
      deleteError: 'حذف کتاب ممکن نبود.',
      deleting: 'در حال حذف...'
    },
    wishlist: {
      title: 'لیست خرید',
      description: 'کتاب‌های خرید آینده و لینک‌های معتبر را یکجا نگه دارید.',
      addTitle: 'افزودن به لیست خرید',
      expectedPrice: 'قیمت تقریبی',
      notes: 'یادداشت کوتاه',
      addAction: 'ثبت در لیست خرید',
      emptyTitle: 'لیست خرید خالی است',
      emptyDescription: 'کتاب‌هایی که قصد خرید یا مطالعه‌شان را دارید اینجا نگه دارید.',
      linkLabel: 'برچسب فروشگاه (اختیاری)',
      urlPlaceholder: 'https://example.com/book'
    },
    profile: {
      title: 'پروفایل',
      description: 'جزئیات حساب و تنظیمات امنیتی را مدیریت کنید.',
      updateName: 'به‌روزرسانی نام',
      newName: 'نام جدید',
      updateNameAction: 'ثبت نام',
      nameSuccess: 'نام با موفقیت به‌روز شد.',
      updatePassword: 'به‌روزرسانی رمز عبور',
      currentPassword: 'رمز عبور فعلی',
      newPassword: 'رمز عبور جدید',
      updatePasswordAction: 'ثبت رمز عبور',
      passwordSuccess: 'رمز عبور با موفقیت به‌روز شد.',
      reminders: 'یادآور مطالعه',
      reminderEnabled: 'فعال‌سازی یادآور',
      daily: 'روزانه',
      weekdays: 'روزهای کاری',
      weekends: 'آخر هفته',
      weekly: 'هفتگی',
      saveReminders: 'ذخیره تنظیمات یادآور',
      reminderSuccess: 'تنظیمات یادآور ذخیره شد.',
      notesTitle: 'یادداشت‌های شخصی',
      notesPlaceholder: 'یادداشت شخصی درباره برنامه مطالعه‌ات...'
    },
    status: {
      inLibrary: 'در کتابخانه',
      currentlyReading: 'در حال مطالعه',
      finished: 'تمام‌شده',
      nextToRead: 'بعدی برای مطالعه'
    },
    books: {
      reading: 'در حال مطالعه',
      readingDesc: 'کتاب‌های فعال را دنبال کنید و پیشرفت را سریع ثبت کنید.',
      finished: 'تمام‌شده',
      finishedDesc: 'کتاب‌های تمام‌شده را مرور کنید.',
      nextToRead: 'بعدی برای مطالعه',
      nextToReadDesc: 'صف مطالعه بعدی را مدیریت کنید.',
      updateProgress: 'به‌روزرسانی پیشرفت',
      markFinished: 'ثبت به عنوان تمام‌شده',
      startReading: 'شروع مطالعه',
      actions: 'اقدامات کتاب',
      moveTo: 'انتقال به',
      readingProgress: 'پیشرفت مطالعه',
      completed: 'تکمیل‌شده',
      notFinished: 'هنوز تمام نشده',
      delete: 'حذف کتاب',
      collection: 'مجموعه مطالعه',
      emptyTitle: 'کتابی پیدا نشد',
      emptyDescription: 'کتاب‌ها را از کتابخانه به این بخش منتقل کنید.',
      notesTitle: 'یادداشت‌ها و هایلایت‌ها',
      notePlaceholder: 'یادداشت شما',
      highlightPlaceholder: 'نقل‌قول یا هایلایت (اختیاری)',
      saveNote: 'ذخیره یادداشت',
      notesEmpty: 'هنوز یادداشتی ثبت نشده است. اولین برداشتت را بنویس.'
    },
    query: {
      errorTitle: 'مشکلی پیش آمد',
      errorDescription: 'بارگذاری این بخش ممکن نبود.',
      retry: 'تلاش دوباره'
    }
  }
} as const
