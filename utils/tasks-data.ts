/**
 * This project was developed by Nikandr Surkov.
 * You may not use this code if you purchased it from any source other than the official website https://nikandr.com.
 * If you purchased it from the official website, you may use it for your own projects,
 * but you may not resell it or publish it publicly.
 * 
 * Website: https://nikandr.com
 * YouTube: https://www.youtube.com/@NikandrSurkov
 * Telegram: https://t.me/nikandr_s
 * Telegram channel for news/updates: https://t.me/clicker_game_news
 * GitHub: https://github.com/nikandr-surkov
 */


export const earnData = [
    {
      category: "CRETON Youtube",
      tasks: [
        {
          title: "Enjoy SpaceRun on another hot map.",
          points: 5000,
          image: "youtube",
          description: "The MARS MAP of the upcoming SPACERUN game.",
          callToAction: "Watch video",
          type: "VISIT",
          taskData: {
            link: "https://www.youtube.com/watch?v=jtCCt8IjwxA"
          },
          isActive: true  
        },
        {
          title: "Let's play SPACERUN game.",
          points: 5000,
          image: "youtube",
          description: "SpaceRun game is easy and fun.",
          callToAction: "Watch video",
          type: "VISIT",
          taskData: {
            link: "https://www.youtube.com/watch?v=XtgOMy7UXt8"
          },
          isActive: true  
        },
        {
          title: "$CRETON EVENT",
          points: 5000,
          image: "youtube",
          description: "Event for Beta (3,000,000 $CRETON distribution)",
          callToAction: "Watch video",
          type: "VISIT",
          taskData: {
            link: "https://www.youtube.com/shorts/7LIH7PrBVKA"
          },
          isActive: true  
        },
      ]
    },
    {
      category: "Tasks list",
      tasks: [
        {
          title: "Join $CRETON News / Updates",
          points: 5000,
          image: "telegram",
          description: "Stay updated with the latest news and announcements by joining CRETON News Telegram channel.",
          callToAction: "Join channel",
          type: "TELEGRAM",
          taskData: {
            link: "https://t.me/CRETONoffiical",
            chatId: "CRETONofficial"
          },
          isActive: true  
        },
        {
          title: "Follow $CRETON's X",
          points: 5000,
          image: "twitter",
          description: "Follow me on X (formerly Twitter) for real-time updates and community engagement.",
          callToAction: "Follow on X",
          type: "VISIT",
          taskData: {
            link: "https://x.com/Creton_Game"
          },
          isActive: true  
        },
        {
          title: "Invite 3 friends",
          points: 25000,
          image: "friends",
          description: "Invite your friends to join the CRETON community and earn bonus points for each successful referral.",
          callToAction: "Invite friends",
          type: "REFERRAL",
          taskData: {
            friendsNumber: 3
          },
          isActive: true  
        }
      ]
    },
  ];
