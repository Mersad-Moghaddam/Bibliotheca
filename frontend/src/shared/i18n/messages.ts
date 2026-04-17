export type Locale = 'en' | 'fa'

export const messages = {
  en: {
    common: {
      appName: 'Negar',
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
      platformTitle: 'Negar platform',
      platformSubtitle: 'Focused reading operations for your personal workspace.',
      focusMode: 'Focus mode'
    },
    landing: {
      eyebrow: 'Reading intelligence, without clutter',
      title: 'Design a reading system you can sustain all year.',
      subtitle:
        'Negar combines a calm reading workflow with practical analytics, reminders, and insights so you can finish more of what matters.',
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
          quote: 'Negar made my reading queue finally feel manageable.',
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
          q: 'Can I use Negar for personal reading only?',
          a: 'Yes. Negar is built for personal reading systems and can scale with your habit.'
        },
        {
          q: 'Are reminders real notifications?',
          a: 'Today, reminders are saved as preferences and surfaced in-app, with notification infrastructure ready for expansion.'
        },
        {
          q: 'Does Negar support Persian?',
          a: 'Yes. English and Persian are fully supported, including RTL behavior.'
        }
      ],
      finalCtaTitle: 'Build a calmer, smarter reading routine',
      finalCtaSubtitle: 'Set up your workspace in minutes and keep momentum week after week.',
      footerTagline: 'A focused workspace for modern readers.',
      footerRights: '© Negar. All rights reserved.'
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
      libraryTotal: 'Library (total)',
      currentStreak: 'Weekly streak',
      reminderOn: 'Reminder is on at {time}.',
      reminderOff: 'Reminder is currently off.',
      logSession: 'Log quick session',
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
      currentSnapshotDesc: 'Your active book at a glance, with fast progress actions.',
      keepMomentum: 'Keep your reading momentum moving forward each day.',
      intelligenceDesc: 'Signals and reminders that help you decide what to do next.',
      analyticsDesc: 'A compact view of your most important reading metrics.',
      goalsDesc: 'Set weekly and monthly goals to sustain a steady reading cadence.',
      goalsEmpty: 'No goals yet. Set custom goals or use smart suggestions.',
      goalPercent: '{percent}% complete',
      editGoal: 'Set / edit goals',
      editGoals: 'Edit reading goals',
      suggestedTitle: 'Suggested for you',
      applySuggestion: 'Apply',
      useSuggestions: 'Use smart suggestions',
      pagesGoal: 'Pages goal',
      booksGoal: 'Books goal',
      goalStatus: {
        no_goal: 'No goal',
        not_started: 'Not started',
        in_progress: 'In progress',
        on_track: 'On track',
        completed: 'Completed',
        exceeded: 'Exceeded',
        behind: 'Behind'
      },
      goalSuggestionReasons: {
        restart_pace: 'Based on your recent restart pace, we kept this realistic.',
        consistency_stretch: 'Based on your recent consistency, this is a gentle stretch target.',
        recent_pace: 'Based on your recent reading pace over the last few weeks.',
        fallback: 'Based on your recent activity.'
      },
      noActiveTitle: 'No active books yet',
      noActiveDescription: 'Move a title to Currently Reading to start seeing your progress here.',
      goLibrary: 'Go to library',
      needsAttention: 'Needs attention',
      tidyTitle: 'Everything is tidy',
      tidyDescription: 'No pending books right now—great reading flow.',
      apiInsights: {
        consistency: 'You are reading consistently for multiple weeks.',
        backlog: 'You have a healthy backlog waiting; pick one title to start this week.',
        focus: 'You are juggling several active books. Finishing one may improve momentum.',
        shortBooks: 'You tend to finish shorter books faster. Queue one short book for quick wins.',
        trackProgress: 'Track progress updates this week to unlock personalized insights.',
        goalHit: 'You hit your goal. Great consistency.'
      },
      insights: {
        priorityLabel: 'Primary insight',
        recommendationLabel: 'Best next step',
        variants: {
          positive: 'Strong signal',
          neutral: 'Insight',
          warning: 'Needs attention',
          inactive: 'Inactive'
        },
        states: {
          error: {
            title: 'Could not load reading insights',
            description: 'Your dashboard is fine, but insights could not be prepared right now.',
            retry: 'Try again'
          }
        },
        empty: {
          title: 'Your reading coach is ready',
          message: 'Add one short reading session or update progress to unlock personalized insights.'
        },
        titles: {
          inactive: 'Your momentum has cooled down',
          nearCompletion: 'You are very close to finishing a book',
          resumed: 'Great job getting back into reading',
          consistency: 'Your reading routine is becoming consistent',
          momentum: 'You are building stronger momentum',
          goalAhead: 'You are ahead of your weekly goal',
          goalBehind: 'You are active, but behind your weekly goal',
          focus: 'A little focus could improve progress',
          steady: 'Your reading pace is steady'
        },
        messages: {
          inactive: 'No progress was logged in recent days. A small session today can quickly restore momentum.',
          nearCompletion: 'Finishing your closest book now will create a strong completion boost.',
          resumed: 'You returned this week after a quiet stretch. Keep the comeback going.',
          consistency: 'You logged reading on multiple days this week, which is a strong consistency signal.',
          momentum: 'Your page count is higher than last week, showing positive momentum.',
          goalAhead: 'You have already reached your weekly page target. Excellent rhythm.',
          goalBehind: 'You still have time to recover this week with one or two focused sessions.',
          focus: 'You are splitting attention across several active books with limited recent progress.',
          steady: 'You are progressing. One focused update will make your next insight more specific.'
        },
        recommendations: {
          logFirstSession: 'Log your first reading session this week.',
          rebuildMomentum: 'Add one 15–20 minute session today to restart your rhythm.',
          finishClosestBook: 'Prioritize the book nearest to completion and finish it.',
          keepRhythm: 'Protect your current rhythm with one more session this week.',
          maintainGoal: 'Keep your pace and stretch toward your next weekly milestone.',
          smallSessionToday: 'Schedule one short session today to get back on target.',
          focusOneBook: 'Choose one active title as your focus book for this week.',
          logProgressOnCurrent: 'Log progress on your current book to sharpen your insights.'
        },
        signals: {
          activeBooks: 'Active books',
          loggedSessions: 'Logged sessions',
          daysSinceLastActivity: 'Days since last activity',
          sessionsThisWeek: 'Sessions this week',
          activeDaysThisWeek: 'Active days this week',
          pagesThisWeek: 'Pages this week',
          pagesLastWeek: 'Pages last week',
          closestBookProgress: 'Closest book progress',
          goalProgress: 'Weekly goal progress'
        }
      }
    },
    library: {
      title: 'Library',
      description: 'Keep every title organized and route books into your reading pipeline.',
      addBook: 'Add a new book',
      addBookDescription: 'Capture key details now and organize your reading flow later.',
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
      status: 'Status',
      genreFallback: 'General reading',
      sortRecent: 'Recently updated',
      sortTitle: 'Title',
      allStatuses: 'All statuses',
      collectionSummary: '{visible} of {total} books in your library',
      allStatusesHint: 'Library always includes all saved books. Status filters only narrow this view.',
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
      addDescription: 'Save books you want to buy, borrow, or track later.',
      expectedPrice: 'Expected price',
      notes: 'Short note',
      addAction: 'Add to wishlist',
      removeAction: 'Remove from wishlist',
      deleteConfirm: 'Remove this item from your wishlist?',
      deleteSuccess: 'Item removed from wishlist.',
      deleteError: 'Could not remove this wishlist item.',
      deleting: 'Removing...',
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
      reminderTime: 'Reminder time',
      reminderFrequency: 'Reminder cadence',
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
      actionsDescription: 'Move this title, update progress, or remove it from your library.',
      moveTo: 'Move to',
      readingProgress: 'Reading progress',
      completed: 'Completed',
      notFinished: 'Not finished yet',
      delete: 'Delete book',
      collection: 'Reading collection',
      emptyTitle: 'No books found',
      emptyDescription: 'Move books from your library to continue.',
      notesTitle: 'Notes & highlights',
      isbnLabel: 'ISBN',
      editDetailsTitle: 'Edit details',
      editDetailsDescription: 'Update the book information saved in your library.',
      bookUpdated: 'Book details updated.',
      updateError: 'Failed to update book details.',
      noteLabel: 'Your reading note',
      highlightLabel: 'Optional highlight',
      notePlaceholder: 'Your note',
      highlightPlaceholder: 'Optional quote/highlight',
      saveNote: 'Save note',
      notesEmpty: 'No notes yet. Capture your first thought from this book.'
    },
    query: {
      errorTitle: 'Something went wrong',
      errorDescription: 'We could not load this section.',
      retry: 'Retry'
    },
    validation: {
      validEmail: 'Enter a valid email address.',
      passwordRequired: 'Password is required.',
      nameMin: 'Name must be at least 2 characters.',
      passwordMin: 'Password must be at least 6 characters.',
      confirmPasswordRequired: 'Please confirm your password.',
      passwordMismatch: 'Passwords do not match.',
      titleRequired: 'Title is required.',
      authorRequired: 'Author is required.',
      totalPagesMin: 'Total pages must be at least 1.',
      pageNonNegative: 'Page cannot be negative.',
      coverUrlValid: 'Cover URL must be a valid URL.',
      currentPageMax: 'Current page cannot exceed total pages.',
      currentPasswordRequired: 'Current password is required.',
      newPasswordMin: 'New password must be at least 6 characters.',
      timeRequired: 'Time is required.',
      validUrl: 'Enter a valid URL.',
      priceNonNegative: 'Price cannot be negative.'
    }
  },
  fa: {
    common: {
      appName: 'نگار',
      search: 'جستجو',
      details: 'جزئیات',
      save: 'ذخیره',
      cancel: 'لغو',
      confirm: 'تأیید',
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
      wishlist: 'فهرست خرید',
      profile: 'پروفایل',
      signOut: 'خروج',
      workspace: 'فضای کار',
      readingFlow: 'جریان مطالعه',
      account: 'حساب کاربری',
      platformTitle: 'نگار',
      platformSubtitle: 'همراه مطالعه ات',
      focusMode: 'حالت تمرکز'
    },
    landing: {
      eyebrow: 'همراه مطالعه ات',
      title: 'کتاب خواندن را به یک عادت واقعی تبدیل کن.',
      subtitle:
        'نگار کمک می‌کند کتاب‌هایت را مرتب کنی، پیشرفتت را ببینی و بدون شلوغی، مسیر مطالعه‌ات را جلو ببری.',
      ctaPrimary: 'شروع رایگان',
      ctaSecondary: 'ورود',
      productPreview: '',
      previewCard1Title: 'ثبات هفتگی',
      previewCard1Value: '+۱۸٪',
      previewCard2Title: 'پیشرفت کتاب‌هایی که در حال خواندن‌شان هستی',
      previewCard3: 'یادآورها و پیشنهادهایی بر اساس روند واقعی مطالعه‌ات.',
      valueCards: [
        {
          title: 'همه‌چیز یک‌جا و مرتب',
          text: 'کتابخانه، کتاب‌های در حال مطالعه و لیست بعدی را بدون سردرگمی مدیریت کن.'
        },
        {
          title: 'پیشرفت قابل‌فهم',
          text: 'با چند عدد ساده ببین چقدر جلو رفته‌ای و چه‌قدر تا پایان مانده.'
        },
        {
          title: 'ریتم پایدار',
          text: 'با یادآورها و بینش‌های کاربردی، مطالعه‌ات را هفته‌به‌هفته جلو ببر.'
        }
      ],
      workflowTitle: 'اضافه کن → مرتب کن → بخوان → پیشرفت را ثبت کن → تمام کن → برو سراغ بعدی',
      workflowSteps: [
        'کتاب را سریع اضافه کن',
        'بر اساس وضعیت مرتبش کن',
        'با تمرکز بخوان',
        'پیشرفتت را مرور کن',
        'با خیال راحت تمامش کن',
        'کتاب بعدی را انتخاب کن'
      ],
      analyticsTitle: 'آمارهایی که واقعاً به کارت می‌آیند',
      analyticsText: 'فقط چند شاخص مهم را می‌بینی: ریتم مطالعه، سرعت پیشرفت و وضعیت لیستت.',
      analyticsMetrics: [
        { label: 'نرخ تکمیل', value: '۶۴٪' },
        { label: 'صفحات ثبت‌شده', value: '۱۲۴۰' },
        { label: 'کتاب فعال', value: '۳' },
        { label: 'رشته هفتگی', value: '۴ هفته' }
      ],
      useCasesTitle: 'برای هرکسی که می‌خواهد منظم‌تر کتاب بخواند',
      useCases: [
        'دانشجوها برای برنامه‌ریزی بهتر مطالعه',
        'کسانی که هم‌زمان چند موضوع می‌خوانند',
        'افرادی که برای کار و رشد شخصی کتاب می‌خوانند',
        'کتاب‌دوست‌هایی که لیست مطالعه بلند دارند',
        'هرکسی که می‌خواهد مطالعه برایش پیوسته بماند'
      ],
      trustTitle: 'نظر کاربران (دسترسی اولیه)',
      testimonials: [],
      faqTitle: 'سوالات متداول',
      faq: [
        {
          q: 'می‌شود نگار را فقط برای مطالعه شخصی استفاده کرد؟',
          a: 'بله. نگار برای مطالعه شخصی ساخته شده و با ریتم تو هماهنگ می‌شود.'
        },
        {
          q: 'یادآورها اعلان واقعی هم هستند؟',
          a: 'فعلاً یادآورها داخل خود اپ نمایش داده می‌شوند و زیرساخت اعلان برای نسخه‌های بعدی آماده است.'
        },
        {
          q: 'پشتیبانی فارسی کامل است؟',
          a: 'بله، فارسی و انگلیسی کامل پشتیبانی می‌شوند و RTL هم به‌درستی رعایت شده است.'
        }
      ],
      finalCtaTitle: 'مطالعه‌ات را ساده، منظم و قابل‌ادامه کن',
      finalCtaSubtitle: 'در چند دقیقه شروع کن و قدم‌به‌قدم ریتم مطالعه‌ات را نگه دار.',
      footerTagline: 'همراه ساده و کاربردی برای خواندن روزانه.',
      footerRights: '© نگار. همهٔ حقوق محفوظ است.'
    },
    auth: {
      createAccount: 'ایجاد حساب کاربری',
      welcomeBack: 'خوش برگشتی',
      name: 'نام',
      email: 'ایمیل',
      password: 'رمز عبور',
      confirmPassword: 'تکرار رمز عبور',
      signUp: 'ثبت‌نام',
      logIn: 'ورود',
      registerSubtitle: 'خانه‌ای مرتب برای کتاب‌ها، یادداشت‌ها و ریتم مطالعه‌ات بساز.',
      loginSubtitle: 'به برنامه مطالعه‌ات برگرد و دقیقاً از همان نقطه ادامه بده.',
      hasAccount: 'حساب داری؟',
      needAccount: 'حساب نداری؟',
      registrationFailed: 'ثبت‌نام ناموفق بود. اطلاعات را بررسی کنید.',
      invalidCredentials: 'اطلاعات ورود نامعتبر است.',
      emailAlreadyExists: 'حسابی با این ایمیل از قبل وجود دارد.',
      missingFields: 'لطفاً فیلدهای لازم را درست کامل کن.',
      networkFailure: 'ارتباط با سرور برقرار نشد. اینترنتت را چک کن و دوباره تلاش کن.',
      unexpectedServerError: 'یک خطای غیرمنتظره رخ داد. دوباره تلاش کن.'
    },
    dashboard: {
      title: 'داشبورد',
      description: 'از همین‌جا ببین کجای مسیر مطالعه‌ای و سریع تصمیم بگیر قدم بعدی چیست.',
      analyticsTitle: 'آمار مطالعه',
      intelligenceTitle: 'پیشنهادهای مطالعه',
      totalPagesRead: 'صفحات خوانده‌شده',
      completionRate: 'نرخ تکمیل',
      readingPace: 'کتاب در ماه',
      libraryTotal: 'کتابخانه',
      currentStreak: 'تداوم هفتگی',
      reminderOn: 'یادآور در ساعت {time} فعال است.',
      reminderOff: 'یادآور غیرفعال است.',
      logSession: 'ثبت یک جلسه سریع',
      sessionsCount: '{count} جلسه اخیر',
      emptyAnalyticsTitle: 'هنوز آماری نداریم',
      emptyAnalyticsDescription: 'با اضافه‌کردن کتاب و ثبت پیشرفت، آمار این بخش نمایش داده می‌شود.',
      consistency: 'ثبات مطالعه',
      goalsTitle: 'اهداف مطالعه',
      goalSummary: '{pagesRead}/{pagesGoal} صفحه · {booksRead}/{booksGoal} کتاب',
      periodWeekly: 'هدف هفتگی',
      periodMonthly: 'هدف ماهانه',
      setWeekly: 'هدف هفتگی',
      setMonthly: 'هدف ماهانه',
      currentSnapshot: 'وضعیت مطالعه فعلی',
      currentSnapshotDesc: 'یک نگاه سریع به کتاب فعلی‌ات، همراه با اقدام‌های لازم برای ادامه.',
      keepMomentum: 'شتاب مطالعه‌ات را هر روز با گام‌های کوچک حفظ کن.',
      intelligenceDesc: 'پیشنهادها و یادآورهایی که کمک می‌کنند بدانی قدم بعدی چیست.',
      analyticsDesc: 'نمایی فشرده از مهم‌ترین شاخص‌های مطالعه‌ات.',
      goalsDesc: 'برای حفظ ریتم مطالعه، هدف هفتگی و ماهانه تنظیم کن.',
      goalsEmpty: 'هنوز هدفی نداری. خودت هدف بگذار یا از پیشنهادهای آماده استفاده کن.',
      goalPercent: '{percent}٪ تکمیل',
      editGoal: 'تنظیم یا ویرایش هدف',
      editGoals: 'ویرایش اهداف مطالعه',
      suggestedTitle: 'پیشنهاد برای شما',
      applySuggestion: 'اعمال',
      useSuggestions: 'استفاده از پیشنهاد هوشمند',
      pagesGoal: 'هدف صفحات',
      booksGoal: 'هدف کتاب‌ها',
      goalStatus: {
        no_goal: 'بدون هدف',
        not_started: 'شروع نشده',
        in_progress: 'در حال پیشرفت',
        on_track: 'روی مسیر',
        completed: 'تکمیل شده',
        exceeded: 'فراتر از هدف',
        behind: 'عقب‌تر از برنامه'
      },
      goalSuggestionReasons: {
        restart_pace: 'با توجه به بازگشت اخیرت به مطالعه، این پیشنهاد را واقع‌بینانه تنظیم کردیم.',
        consistency_stretch: 'با توجه به ثبات اخیرت، این هدف کمی چالشی اما قابل‌دستیابی است.',
        recent_pace: 'این پیشنهاد بر اساس ریتم مطالعه چند هفته اخیرت ارائه شده است.',
        fallback: 'این پیشنهاد بر اساس فعالیت اخیرت ارائه شده است.'
      },
      noActiveTitle: 'فعلاً کتاب فعالی نداری',
      noActiveDescription: 'یک کتاب را به «در حال مطالعه» ببر تا این بخش فعال شود.',
      goLibrary: 'برو به کتابخانه',
      needsAttention: 'نیازمند توجه',
      tidyTitle: 'همه‌چیز مرتب است',
      tidyDescription: 'فعلاً موردی در انتظار نیست.',
      apiInsights: {
        consistency: 'چند هفته است که با ثبات مطالعه می‌کنی.',
        backlog: 'چند کتاب خوب در صف داری؛ این هفته یکی را شروع کن.',
        focus: 'چند کتاب را هم‌زمان جلو می‌بری؛ تمام‌کردن یکی می‌تواند شتابت را بهتر کند.',
        shortBooks: 'معمولاً کتاب‌های کوتاه را سریع‌تر تمام می‌کنی؛ یک کتاب کوتاه برای برد سریع انتخاب کن.',
        trackProgress: 'این هفته چند به‌روزرسانی پیشرفت ثبت کن تا بینش‌های شخصی‌تر فعال شوند.',
        goalHit: 'به هدفت رسیدی. ثباتت عالیه.'
      },
      insights: {
        priorityLabel: 'بینش اصلی',
        recommendationLabel: 'بهترین اقدام بعدی',
        variants: {
          positive: 'سیگنال مثبت',
          neutral: 'بینش',
          warning: 'نیازمند توجه',
          inactive: 'کم‌تحرک'
        },
        states: {
          error: {
            title: 'بارگذاری بینش‌های مطالعه انجام نشد',
            description: 'داشبورد پایدار است، اما فعلاً تولید بینش ممکن نشد.',
            retry: 'تلاش دوباره'
          }
        },
        empty: {
          title: 'مربی مطالعه‌ات آماده است',
          message: 'یک جلسه کوتاه ثبت کن یا پیشرفت کتابت را به‌روزرسانی کن تا بینش شخصی فعال شود.'
        },
        titles: {
          inactive: 'شتاب مطالعه‌ات کمی افت کرده',
          nearCompletion: 'خیلی نزدیکِ تمام‌کردن یکی از کتاب‌ها هستی',
          resumed: 'عالیه که دوباره به مطالعه برگشتی',
          consistency: 'برنامه مطالعه‌ات دارد منظم می‌شود',
          momentum: 'شتاب مطالعه‌ات رو به رشد است',
          goalAhead: 'از هدف هفتگی جلوتر هستی',
          goalBehind: 'فعال هستی، اما از هدف هفتگی عقب مانده‌ای',
          focus: 'کمی تمرکز، نتیجه را بهتر می‌کند',
          steady: 'ریتم مطالعه‌ات پایدار است'
        },
        messages: {
          inactive: 'در چند روز اخیر پیشرفتی ثبت نشده است. یک جلسه کوتاه امروز می‌تواند ریتمت را برگرداند.',
          nearCompletion: 'اگر همین حالا کتاب نزدیک به پایان را تمام کنی، شتاب خوبی می‌گیری.',
          resumed: 'این هفته بعد از یک وقفه برگشتی. همین روند بازگشت را حفظ کن.',
          consistency: 'این هفته در چند روز مختلف مطالعه ثبت کرده‌ای؛ نشانه خوبی از ثبات است.',
          momentum: 'تعداد صفحات این هفته از هفته قبل بیشتر شده و این یعنی شتاب مثبت.',
          goalAhead: 'هدف هفتگی صفحاتت را رد کرده‌ای. ریتمت عالی است.',
          goalBehind: 'هنوز فرصت جبران داری؛ یک یا دو جلسه متمرکز می‌تواند تو را به هدف نزدیک کند.',
          focus: 'کتاب‌های فعالت زیاد شده‌اند و پیشرفت اخیر بین آن‌ها پخش شده است.',
          steady: 'در مسیر هستی. با یک ثبت پیشرفت متمرکز، بینش بعدی دقیق‌تر می‌شود.'
        },
        recommendations: {
          logFirstSession: 'اولین جلسه مطالعه این هفته را ثبت کن.',
          rebuildMomentum: 'امروز یک جلسه ۱۵ تا ۲۰ دقیقه‌ای اضافه کن تا ریتمت برگردد.',
          finishClosestBook: 'کتابی را که نزدیک پایان است در اولویت بگذار و تمامش کن.',
          keepRhythm: 'برای حفظ این ریتم، یک جلسه دیگر همین هفته ثبت کن.',
          maintainGoal: 'همین سرعت را نگه دار و به هدف بعدی هفتگی فکر کن.',
          smallSessionToday: 'امروز یک جلسه کوتاه برنامه‌ریزی کن تا دوباره روی هدف قرار بگیری.',
          focusOneBook: 'این هفته یک کتاب فعال را به‌عنوان تمرکز اصلی انتخاب کن.',
          logProgressOnCurrent: 'پیشرفت کتاب فعلی را ثبت کن تا بینش‌ها دقیق‌تر شوند.'
        },
        signals: {
          activeBooks: 'کتاب‌های فعال',
          loggedSessions: 'جلسه‌های ثبت‌شده',
          daysSinceLastActivity: 'روز از آخرین فعالیت',
          sessionsThisWeek: 'جلسه این هفته',
          activeDaysThisWeek: 'روزهای فعال این هفته',
          pagesThisWeek: 'صفحه این هفته',
          pagesLastWeek: 'صفحه هفته قبل',
          closestBookProgress: 'پیشرفت نزدیک‌ترین کتاب',
          goalProgress: 'پیشرفت هدف هفتگی'
        }
      }
    },
    library: {
      title: 'کتابخانه',
      description: 'همهٔ کتاب‌هایت را یک‌جا نگه دار و برای هرکدام وضعیت درست را انتخاب کن.',
      addBook: 'افزودن کتاب جدید',
      addBookDescription: 'اطلاعات اصلی کتاب را ثبت کن و بعداً آن را در مسیر مطالعه قرار بده.',
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
      status: 'وضعیت',
      genreFallback: 'مطالعه عمومی',
      sortRecent: 'آخرین به‌روزرسانی',
      sortTitle: 'عنوان',
      allStatuses: 'همه وضعیت‌ها',
      collectionSummary: '{visible} از {total} کتاب در کتابخانه‌ات',
      allStatusesHint: 'کتابخانه همیشه همهٔ کتاب‌ها را نگه می‌دارد؛ فیلتر وضعیت فقط نمایش را محدود می‌کند.',
      noBooksTitle: 'کتابی پیدا نشد',
      noBooksDescription: 'یک کتاب اضافه کن یا فیلترها را عوض کن.',
      clearFilters: 'پاک‌کردن فیلترها',
      deleteConfirm: 'مطمئنی می‌خواهی این کتاب حذف شود؟',
      deleteSuccess: 'کتاب با موفقیت حذف شد.',
      deleteError: 'حذف کتاب ممکن نبود.',
      deleting: 'در حال حذف...'
    },
    wishlist: {
      title: 'فهرست خرید',
      description: 'کتاب‌هایی را که می‌خواهی بخری یا بعداً بررسی کنی، اینجا نگه دار.',
      addTitle: 'افزودن به فهرست خرید',
      addDescription: 'کتاب‌هایی را که می‌خواهی بخری یا بعداً بررسی کنی اینجا نگه دار.',
      expectedPrice: 'قیمت تقریبی',
      notes: 'یادداشت کوتاه',
      addAction: 'افزودن به فهرست',
      removeAction: 'حذف از فهرست خرید',
      deleteConfirm: 'این مورد از فهرست خرید حذف شود؟',
      deleteSuccess: 'مورد از فهرست خرید حذف شد.',
      deleteError: 'حذف این مورد ممکن نبود.',
      deleting: 'در حال حذف...',
      emptyTitle: 'فهرست خریدت خالی است',
      emptyDescription: 'کتاب‌هایی که احتمالاً می‌خواهی بخری یا بخوانی، اینجا ذخیره کن.',
      linkLabel: 'برچسب فروشگاه (اختیاری)',
      urlPlaceholder: 'https://example.com/book'
    },
    profile: {
      title: 'پروفایل',
      description: 'تنظیمات حساب، امنیت و یادآورهای مطالعه‌ات را یکجا مدیریت کن.',
      updateName: 'ویرایش نام',
      newName: 'نام جدید',
      updateNameAction: 'ذخیره نام',
      nameSuccess: 'نام با موفقیت به‌روز شد.',
      updatePassword: 'تغییر رمز عبور',
      currentPassword: 'رمز عبور فعلی',
      newPassword: 'رمز عبور جدید',
      updatePasswordAction: 'ذخیره رمز جدید',
      passwordSuccess: 'رمز عبور با موفقیت به‌روز شد.',
      reminders: 'یادآور مطالعه',
      reminderEnabled: 'فعال‌سازی یادآور',
      reminderTime: 'زمان یادآور',
      reminderFrequency: 'تناوب یادآور',
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
      readingDesc: 'کتاب‌هایی که در حال خواندن‌شان هستی را ببین و پیشرفتت را سریع ثبت کن.',
      finished: 'تمام‌شده',
      finishedDesc: 'کتاب‌هایی که تمام کرده‌ای را یک‌جا مرور کن.',
      nextToRead: 'بعدی برای مطالعه',
      nextToReadDesc: 'لیست «بعدی برای مطالعه» را مرتب کن و سریع شروع کن.',
      updateProgress: 'به‌روزرسانی پیشرفت',
      markFinished: 'علامت‌گذاری به‌عنوان تمام‌شده',
      startReading: 'شروع مطالعه',
      actions: 'اقدامات کتاب',
      actionsDescription: 'کتاب را جابه‌جا کن، پیشرفت را به‌روز کن یا از کتابخانه حذف کن.',
      moveTo: 'انتقال به',
      readingProgress: 'پیشرفت مطالعه',
      completed: 'تکمیل‌شده',
      notFinished: 'هنوز تمام نشده',
      delete: 'حذف کتاب',
      collection: 'مجموعه مطالعه',
      emptyTitle: 'کتابی پیدا نشد',
      emptyDescription: 'از کتابخانه کتاب اضافه کن تا این بخش فعال شود.',
      notesTitle: 'یادداشت‌ها و نکته‌های مهم',
      isbnLabel: 'شابک',
      editDetailsTitle: 'ویرایش اطلاعات کتاب',
      editDetailsDescription: 'اگر لازم است اطلاعات این کتاب را همین‌جا ویرایش کن.',
      bookUpdated: 'مشخصات کتاب به‌روزرسانی شد.',
      updateError: 'به‌روزرسانی مشخصات کتاب ناموفق بود.',
      noteLabel: 'یادداشت مطالعه',
      highlightLabel: 'نکتهٔ مهم (اختیاری)',
      notePlaceholder: 'یادداشت شما',
      highlightPlaceholder: 'یک نقل‌قول یا نکتهٔ مهم (اختیاری)',
      saveNote: 'ذخیره یادداشت',
      notesEmpty: 'هنوز یادداشتی ثبت نشده است. اولین برداشتت را بنویس.'
    },
    query: {
      errorTitle: 'مشکلی پیش آمد',
      errorDescription: 'بارگذاری این بخش ممکن نبود.',
      retry: 'تلاش دوباره'
    },
    validation: {
      validEmail: 'ایمیل معتبر وارد کن.',
      passwordRequired: 'رمز عبور را وارد کن.',
      nameMin: 'نام باید حداقل ۲ کاراکتر باشد.',
      passwordMin: 'رمز عبور باید حداقل ۶ کاراکتر باشد.',
      confirmPasswordRequired: 'تکرار رمز عبور را وارد کن.',
      passwordMismatch: 'رمز عبور و تکرارش یکی نیستند.',
      titleRequired: 'عنوان کتاب را وارد کن.',
      authorRequired: 'نام نویسنده را وارد کن.',
      totalPagesMin: 'تعداد صفحات باید حداقل ۱ باشد.',
      pageNonNegative: 'شماره صفحه نمی‌تواند منفی باشد.',
      coverUrlValid: 'آدرس جلد معتبر نیست.',
      currentPageMax: 'شماره صفحه نمی‌تواند از تعداد کل صفحات بیشتر باشد.',
      currentPasswordRequired: 'رمز عبور فعلی را وارد کن.',
      newPasswordMin: 'رمز عبور جدید باید حداقل ۶ کاراکتر باشد.',
      timeRequired: 'زمان یادآور را وارد کن.',
      validUrl: 'لینک معتبر وارد کن.',
      priceNonNegative: 'قیمت نمی‌تواند منفی باشد.'
    }
  }
} as const
