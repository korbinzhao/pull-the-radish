var radishCount = 0,//拔出萝卜的数量
	marmotBeatCount = 0,//敲打地鼠的数量
  marmotPullCount = 0,//失误拔地鼠的数量
	redPacketCount = 0,//拔出红包的数量
  holeStatusArr = [],
  timeCount = 0,//每过10毫秒计数累加一次
  totalTimeCount = 6000 / 10,//总时间60秒，共计数60次
	isInit = true;//是否是初始化页面


cc.game.onStart = function(){

	//全屏显示
	cc.view.setDesignResolutionSize(640,1000,cc.ResolutionPolicy.SHOW_ALL);

	cc.LoaderScene.preload(["images/up-ground.jpg","images/under-ground.jpg","images/grass1.png","images/grass2.png","images/grass3.png","images/grass4.png","images/hole.jpg","images/start.jpg","images/ready.png","images/go.png","images/timeslot.png","images/time-bar.jpg","images/beetle.png","images/popup-radish.png","images/popup-red-packet.png"], function(){

      var MyScene = cc.Scene.extend({
        onEnter:function(){
          this._super();

          var self = this;

          //director尺寸
          self.size = cc.director.getWinSize();
          //配置信息
          self.GameConfig = {
            "hole1":{
              "x": self.size.width/2 - 180,
              "y": self.size.height/2 - 180,
              "zIndex": 30
            },
            "hole2":{
              "x": self.size.width/2,
              "y": self.size.height/2 - 180,
              "zIndex": 30
            },
            "hole3":{
              "x": self.size.width/2 + 180,
              "y": self.size.height/2 - 180,
              "zIndex": 30
            },
            "hole4":{
              "x": self.size.width/2 - 180,
              "y": self.size.height/2 - 340,
              "zIndex": 60
            },
            "hole5":{
              "x": self.size.width/2,
              "y": self.size.height/2 - 340,
              "zIndex": 60
            },
            "hole6":{
              "x": self.size.width/2 + 180,
              "y": self.size.height/2 - 340,
              "zIndex": 60
            },
            "hole7":{
              "x": self.size.width/2 - 180,
              "y": self.size.height/2 - 500,
              "zIndex": 80
            },
            "hole8":{
              "x": self.size.width/2,
              "y": self.size.height/2 - 500,
              "zIndex": 80
            },
            "hole9":{
              "x": self.size.width/2 + 180,
              "y": self.size.height/2 - 500,
              "zIndex": 80
            },

            //sprite出现的概率
            "RADISH_RATE": 0.15,
            "MARMOT_RATE": 0.05,
            "RED_PACKET_RATE": 0.025,
            "STEP_TIME":300, //每隔多长时间出现一波萝卜精灵，单位毫秒ms
            "JUMP_UP_TIME":1//萝卜等精灵跳出跳回所用时间，单位秒s


          }


          var upBackground = cc.Sprite.create("images/up-ground.jpg");
          upBackground.setPosition(self.size.width / 2, self.size.height / 2 + 75);
          this.addChild(upBackground, 0);

          var underGround = cc.Sprite.create("images/under-ground.jpg");
          underGround.setPosition(self.size.width / 2, 75);
          this.addChild(underGround, 100);


          var grass1 = cc.Sprite.create("images/grass1.png");
          grass1.setPosition(self.size.width / 2, 190);
          this.addChild(grass1, 100);

          var hole1 = cc.Sprite.create("images/hole.jpg");
          hole1.setPosition(self.size.width / 2, 225);
          this.addChild(hole1, 75);

          var grass2 = cc.Sprite.create("images/grass2.png");
          grass2.setPosition(self.size.width / 2, 307);
          this.addChild(grass2, 75);

          var hole2 = cc.Sprite.create("images/hole.jpg");
          hole2.setPosition(self.size.width / 2, 379);
          this.addChild(hole2, 50);

          var grass3 = cc.Sprite.create("images/grass3.png");
          grass3.setPosition(self.size.width / 2, 460);
          this.addChild(grass3, 50);

          var grass4 = cc.Sprite.create("images/grass4.png");
          grass4.setPosition(self.size.width / 2, 590);
          this.addChild(grass4, 25);

          self.start = cc.Sprite.create("images/start.jpg");
          self.start.setPosition(self.size.width / 2, self.size.height / 2);
          self.start.group = 'start';
          this.addChild(self.start, 100);

          self.ready = cc.Sprite.create("images/ready.png");
          self.ready.setPosition(self.size.width / 2, self.size.height / 2);
          this.addChild(self.ready, 99);

          self.go = cc.Sprite.create("images/go.png");
          self.go.setPosition(self.size.width / 2, self.size.height / 2);
          this.addChild(self.go, -1);  

          self.timeslot = cc.Sprite.create("images/timeslot.png");
          self.timeslot.setPosition(self.size.width / 2, self.size.height - 30);  
          this.addChild(self.timeslot, 90);                        

          self.timeBar = cc.Sprite.create("images/time-bar.jpg");
          self.timeBar.setPosition(self.size.width - 20, self.size.height - 30);
          self.timeBar.anchorX = 1;//设置timeBar的锚点为x轴为右侧，y轴保持默认为中间
          self.timeBar.setScaleX(0);
          this.addChild(self.timeBar,91);

          self.beetle = cc.Sprite.create("images/beetle.png");
          self.beetle.setPosition(self.size.width - 20, self.size.height - 29);
          self.addChild(self.beetle, 92);

          self.popUpRadish = cc.Sprite.create("images/popup-radish.png");
          self.popUpRadish.setPosition(self.size.width/2, self.size.height/2);
          self.addChild(self.popUpRadish, -1);

          self.popUpRedPacket = cc.Sprite.create("images/popup-red-packet.png");
          self.popUpRedPacket.setPosition(self.size.width, self.size.height);
          self.addChild(self.popUpRedPacket, -1);

          //创建萝卜精灵，共三种萝卜，每种9个
          //第一种萝卜
          self.radish11 = cc.Sprite.create("images/radish1.png");
          self.radish11.group = 'radish';
          self.addChild(self.radish11);

          self.radish12 = cc.Sprite.create("images/radish1.png");
          self.radish12.group = 'radish';
          self.addChild(self.radish12);

          self.radish13 = cc.Sprite.create("images/radish1.png");
          self.radish13.group = 'radish';
          self.addChild(self.radish13);

          self.radish14 = cc.Sprite.create("images/radish1.png");
          self.radish14.group = 'radish';
          self.addChild(self.radish14);

          self.radish15 = cc.Sprite.create("images/radish1.png");
          self.radish15.group = 'radish';
          self.addChild(self.radish15);

          self.radish16 = cc.Sprite.create("images/radish1.png");
          self.radish16.group = 'radish';
          self.addChild(self.radish16);

          self.radish17 = cc.Sprite.create("images/radish1.png");
          self.radish17.group = 'radish';
          self.addChild(self.radish17);

          self.radish18 = cc.Sprite.create("images/radish1.png");
          self.radish18.group = 'radish';
          self.addChild(self.radish18);

          self.radish19 = cc.Sprite.create("images/radish1.png");
          self.radish19.group = 'radish';
          self.addChild(self.radish19);

          //第二种萝卜
          self.radish21 = cc.Sprite.create("images/radish2.png");
          self.radish21.group = 'radish';
          self.addChild(self.radish21);

          self.radish22 = cc.Sprite.create("images/radish2.png");
          self.radish22.group = 'radish';
          self.addChild(self.radish22);

          self.radish23 = cc.Sprite.create("images/radish2.png");
          self.radish23.group = 'radish';
          self.addChild(self.radish23);

          self.radish24 = cc.Sprite.create("images/radish2.png");
          self.radish24.group = 'radish';
          self.addChild(self.radish24);

          self.radish25 = cc.Sprite.create("images/radish2.png");
          self.radish25.group = 'radish';
          self.addChild(self.radish25);

          self.radish26 = cc.Sprite.create("images/radish2.png");
          self.radish26.group = 'radish';
          self.addChild(self.radish26);

          self.radish27 = cc.Sprite.create("images/radish2.png");
          self.radish27.group = 'radish';
          self.addChild(self.radish27);

          self.radish28 = cc.Sprite.create("images/radish2.png");
          self.radish28.group = 'radish';
          self.addChild(self.radish28);

          self.radish29 = cc.Sprite.create("images/radish2.png");
          self.radish29.group = 'radish';
          self.addChild(self.radish29);

          //第三种萝卜
          self.radish31 = cc.Sprite.create("images/radish3.png");
          self.radish31.group = 'radish';
          self.addChild(self.radish31);

          self.radish32 = cc.Sprite.create("images/radish3.png");
          self.radish32.group = 'radish';
          self.addChild(self.radish32);

          self.radish33 = cc.Sprite.create("images/radish3.png");
          self.radish33.group = 'radish';
          self.addChild(self.radish33);

          self.radish34 = cc.Sprite.create("images/radish3.png");
          self.radish34.group = 'radish';
          self.addChild(self.radish34);

          self.radish35 = cc.Sprite.create("images/radish3.png");
          self.radish35.group = 'radish';
          self.addChild(self.radish35);

          self.radish36 = cc.Sprite.create("images/radish3.png");
          self.radish36.group = 'radish';
          self.addChild(self.radish36);

          self.radish37 = cc.Sprite.create("images/radish3.png");
          self.radish37.group = 'radish';
          self.addChild(self.radish37);

          self.radish38 = cc.Sprite.create("images/radish3.png");
          self.radish38.group = 'radish';
          self.addChild(self.radish38);

          self.radish39 = cc.Sprite.create("images/radish3.png");
          self.radish39.group = 'radish';
          self.addChild(self.radish39);

          //创建红包精灵，共三种红包，每种9个
          //创建第一种红包
          self.redPacket11 = cc.Sprite.create("images/redPacket1.png");
          self.redPacket11.group = 'redPacket';
          self.addChild(self.redPacket11);

          self.redPacket12 = cc.Sprite.create("images/redPacket1.png");
          self.redPacket12.group = 'redPacket';
          self.addChild(self.redPacket12);

          self.redPacket13 = cc.Sprite.create("images/redPacket1.png");
          self.redPacket13.group = 'redPacket';
          self.addChild(self.redPacket13);

          self.redPacket14 = cc.Sprite.create("images/redPacket1.png");
          self.redPacket14.group = 'redPacket';
          self.addChild(self.redPacket14);

          self.redPacket15 = cc.Sprite.create("images/redPacket1.png");
          self.redPacket15.group = 'redPacket';
          self.addChild(self.redPacket15);

          self.redPacket16 = cc.Sprite.create("images/redPacket1.png");
          self.redPacket16.group = 'redPacket';
          self.addChild(self.redPacket16);

          self.redPacket17 = cc.Sprite.create("images/redPacket1.png");
          self.redPacket17.group = 'redPacket';
          self.addChild(self.redPacket17);

          self.redPacket18 = cc.Sprite.create("images/redPacket1.png");
          self.redPacket18.group = 'redPacket';
          self.addChild(self.redPacket18);

          self.redPacket19 = cc.Sprite.create("images/redPacket1.png");
          self.redPacket19.group = 'redPacket';
          self.addChild(self.redPacket19);

          //创建第二种红包
          self.redPacket21 = cc.Sprite.create("images/redPacket2.png");
          self.redPacket21.group = 'redPacket';
          self.addChild(self.redPacket21);

          self.redPacket22 = cc.Sprite.create("images/redPacket2.png");
          self.redPacket22.group = 'redPacket';
          self.addChild(self.redPacket22);

          self.redPacket23 = cc.Sprite.create("images/redPacket2.png");
          self.redPacket23.group = 'redPacket';
          self.addChild(self.redPacket23);

          self.redPacket24 = cc.Sprite.create("images/redPacket2.png");
          self.redPacket24.group = 'redPacket';
          self.addChild(self.redPacket24);

          self.redPacket25 = cc.Sprite.create("images/redPacket2.png");
          self.redPacket25.group = 'redPacket';
          self.addChild(self.redPacket25);

          self.redPacket26 = cc.Sprite.create("images/redPacket2.png");
          self.redPacket26.group = 'redPacket';
          self.addChild(self.redPacket26);

          self.redPacket27 = cc.Sprite.create("images/redPacket2.png");
          self.redPacket27.group = 'redPacket';
          self.addChild(self.redPacket27);

          self.redPacket28 = cc.Sprite.create("images/redPacket2.png");
          self.redPacket28.group = 'redPacket';
          self.addChild(self.redPacket28);

          self.redPacket29 = cc.Sprite.create("images/redPacket2.png");
          self.redPacket29.group = 'redPacket';
          self.addChild(self.redPacket29);

          //创建第三种红包
          self.redPacket31 = cc.Sprite.create("images/redPacket3.png");
          self.redPacket31.group = 'redPacket';
          self.addChild(self.redPacket31);

          self.redPacket32 = cc.Sprite.create("images/redPacket3.png");
          self.redPacket32.group = 'redPacket';
          self.addChild(self.redPacket32);

          self.redPacket33 = cc.Sprite.create("images/redPacket3.png");
          self.redPacket33.group = 'redPacket';
          self.addChild(self.redPacket33);

          self.redPacket34 = cc.Sprite.create("images/redPacket3.png");
          self.redPacket34.group = 'redPacket';
          self.addChild(self.redPacket34);

          self.redPacket35 = cc.Sprite.create("images/redPacket3.png");
          self.redPacket35.group = 'redPacket';
          self.addChild(self.redPacket35);

          self.redPacket36 = cc.Sprite.create("images/redPacket3.png");
          self.redPacket36.group = 'redPacket';
          self.addChild(self.redPacket36);

          self.redPacket37 = cc.Sprite.create("images/redPacket3.png");
          self.redPacket37.group = 'redPacket';
          self.addChild(self.redPacket37);

          self.redPacket38 = cc.Sprite.create("images/redPacket3.png");
          self.redPacket38.group = 'redPacket';
          self.addChild(self.redPacket38);

          self.redPacket39 = cc.Sprite.create("images/redPacket3.png");
          self.redPacket39.group = 'redPacket';
          self.addChild(self.redPacket39);

          //创建地鼠,共9个
          self.marmot1 = cc.Sprite.create("images/marmot.png");
          self.marmot1.group = 'marmot';
          self.addChild(this.marmot1);

          self.marmot2 = cc.Sprite.create("images/marmot.png");
          self.marmot2.group = 'marmot';
          self.addChild(this.marmot2);

          self.marmot3 = cc.Sprite.create("images/marmot.png");
          self.marmot3.group = 'marmot';
          self.addChild(this.marmot3);

          self.marmot4 = cc.Sprite.create("images/marmot.png");
          self.marmot4.group = 'marmot';
          self.addChild(this.marmot4);

          self.marmot5 = cc.Sprite.create("images/marmot.png");
          self.marmot5.group = 'marmot';
          self.addChild(this.marmot5);

          self.marmot6 = cc.Sprite.create("images/marmot.png");
          self.marmot6.group = 'marmot';
          self.addChild(this.marmot6);

          self.marmot7 = cc.Sprite.create("images/marmot.png");
          self.marmot7.group = 'marmot';
          self.addChild(this.marmot7);

          self.marmot8 = cc.Sprite.create("images/marmot.png");
          self.marmot8.group = 'marmot';
          self.addChild(this.marmot8);

          self.marmot9 = cc.Sprite.create("images/marmot.png");
          self.marmot9.group = 'marmot';
          self.addChild(this.marmot9);


          self.spriteArr = [];

          self.radish1Arr = [];
          self.radish1Arr[0] = self.radish11;
          self.radish1Arr[1] = self.radish12;
          self.radish1Arr[2] = self.radish13;
          self.radish1Arr[3] = self.radish14;
          self.radish1Arr[4] = self.radish15;
          self.radish1Arr[5] = self.radish16;
          self.radish1Arr[6] = self.radish17;
          self.radish1Arr[7] = self.radish18;
          self.radish1Arr[8] = self.radish19;

          self.radish2Arr = [];
          self.radish2Arr[0] = self.radish21;
          self.radish2Arr[1] = self.radish22;
          self.radish2Arr[2] = self.radish23;
          self.radish2Arr[3] = self.radish24;
          self.radish2Arr[4] = self.radish25;
          self.radish2Arr[5] = self.radish26;
          self.radish2Arr[6] = self.radish27;
          self.radish2Arr[7] = self.radish28;
          self.radish2Arr[8] = self.radish29;

          self.radish3Arr = [];
          self.radish3Arr[0] = self.radish31;
          self.radish3Arr[1] = self.radish32;
          self.radish3Arr[2] = self.radish33;
          self.radish3Arr[3] = self.radish34;
          self.radish3Arr[4] = self.radish35;
          self.radish3Arr[5] = self.radish36;
          self.radish3Arr[6] = self.radish37;
          self.radish3Arr[7] = self.radish38;
          self.radish3Arr[8] = self.radish39;

          self.redPacket1Arr = [];
          self.redPacket1Arr[0] = self.redPacket11;
          self.redPacket1Arr[1] = self.redPacket12;
          self.redPacket1Arr[2] = self.redPacket13;
          self.redPacket1Arr[3] = self.redPacket14;
          self.redPacket1Arr[4] = self.redPacket15;
          self.redPacket1Arr[5] = self.redPacket16;
          self.redPacket1Arr[6] = self.redPacket17;
          self.redPacket1Arr[7] = self.redPacket18;
          self.redPacket1Arr[8] = self.redPacket19;

          self.redPacket2Arr = [];
          self.redPacket2Arr[0] = self.redPacket21;
          self.redPacket2Arr[1] = self.redPacket22;
          self.redPacket2Arr[2] = self.redPacket23;
          self.redPacket2Arr[3] = self.redPacket24;
          self.redPacket2Arr[4] = self.redPacket25;
          self.redPacket2Arr[5] = self.redPacket26;
          self.redPacket2Arr[6] = self.redPacket27;
          self.redPacket2Arr[7] = self.redPacket28;
          self.redPacket2Arr[8] = self.redPacket29;

          self.redPacket3Arr = [];
          self.redPacket3Arr[0] = self.redPacket31;
          self.redPacket3Arr[1] = self.redPacket32;
          self.redPacket3Arr[2] = self.redPacket33;
          self.redPacket3Arr[3] = self.redPacket34;
          self.redPacket3Arr[4] = self.redPacket35;
          self.redPacket3Arr[5] = self.redPacket36;
          self.redPacket3Arr[6] = self.redPacket37;
          self.redPacket3Arr[7] = self.redPacket38;
          self.redPacket3Arr[8] = self.redPacket39;

          self.marmotArr = [];
          self.marmotArr[0] = self.marmot1;
          self.marmotArr[1] = self.marmot2;
          self.marmotArr[2] = self.marmot3;
          self.marmotArr[3] = self.marmot4;
          self.marmotArr[4] = self.marmot5;
          self.marmotArr[5] = self.marmot6;
          self.marmotArr[6] = self.marmot7;
          self.marmotArr[7] = self.marmot8;
          self.marmotArr[8] = self.marmot9;

          self.spriteArr['radish1'] = self.radish1Arr;
          self.spriteArr['radish2'] = self.radish2Arr;
          self.spriteArr['radish3'] = self.radish3Arr;
          self.spriteArr['redPacket1'] = self.redPacket1Arr;
          self.spriteArr['redPacket2'] = self.redPacket2Arr;
          self.spriteArr['redPacket3'] = self.redPacket3Arr;
          self.spriteArr['marmot'] = self.marmotArr;






          var origin = cc.director.getVisibleOrigin();
          var containerForSprite1 = cc.Node.create();

          var startY = null,
              startX = null;

          var touchListener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function(touch, event){
              var target = event.getCurrentTarget();
              var location = touch.getLocation();

              var locationInNode = target.convertToNodeSpace(touch.getLocation());
              var s = target.getContentSize();
              var rect = cc.rect(0, 0, s.width, s.height);

              if (cc.rectContainsPoint(rect, locationInNode)) {
                console.log("sprite began... x = " + locationInNode.x + ", y = " + locationInNode.y);

                startY = location.y;

                target.opacity = 180;

                return true;
              };

              return false;

            },

            onTouchMoved: function(touch,event){

              var target = event.getCurrentTarget();
              var delta = touch.getDelta();

            },

            onTouchEnded: function(touch, event){

              var target = event.getCurrentTarget();
              cc.log("sprite onTouchesEnded.. ");
              target.setOpacity(255);

              var location = touch.getLocation();

              var locationInNode = target.convertToNodeSpace(touch.getLocation());

              endY = location.y;

              if(target.group){
                switch(target.group){
                  case 'start':
                  self.start.zIndex = -1;
                  self.start.removeFromParent();
                  self.gameBegin();
                  break;
                  case 'radish':
                  if((endY - startY) > 10){
                    radishCount++;
                    self.spriteJumpDisappear(target);
                  }
                  break;
                  case 'marmot':
                  if((endY - startY) <= 10){
                    marmotBeatCount++;
                  }
                  else{
                    marmotPullCount++;
                  }
                  break;
                  case 'redPacket':
                  if((endY - startY) > 10){
                    redPacketCount++;
                    self.spriteJumpDisappear(target);
                  }
                  break;
                }
              }
            }
          });

        var bgTouchListener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function(touch,event){
              console.log('grass touch begin');
            },
            onTouchMoved: function(touch,event){
              console.log('grass touch move');
            },
            onTouchEnded: function(touch,event){
              console.log('grass touch end');
            }


          });

        //为背景草地添加空的touch事件，以避免touch草地时也会触发草地下隐藏的萝卜等sprite的touch事件？？？
        cc.eventManager.addListener(bgTouchListener, grass1);
        cc.eventManager.addListener(bgTouchListener.clone(), grass2);
        cc.eventManager.addListener(bgTouchListener.clone(), grass3);
        cc.eventManager.addListener(bgTouchListener.clone(), grass4);

        cc.eventManager.addListener(touchListener, self.start);
        cc.eventManager.addListener(touchListener.clone(), self.radish11);
        cc.eventManager.addListener(touchListener.clone(), self.radish12);
        cc.eventManager.addListener(touchListener.clone(), self.radish13);
        cc.eventManager.addListener(touchListener.clone(), self.radish14);
        cc.eventManager.addListener(touchListener.clone(), self.radish15);
        cc.eventManager.addListener(touchListener.clone(), self.radish16);
        cc.eventManager.addListener(touchListener.clone(), self.radish17);
        cc.eventManager.addListener(touchListener.clone(), self.radish18);
        cc.eventManager.addListener(touchListener.clone(), self.radish19);
        cc.eventManager.addListener(touchListener.clone(), self.radish21);
        cc.eventManager.addListener(touchListener.clone(), self.radish22);
        cc.eventManager.addListener(touchListener.clone(), self.radish23);
        cc.eventManager.addListener(touchListener.clone(), self.radish24);
        cc.eventManager.addListener(touchListener.clone(), self.radish25);
        cc.eventManager.addListener(touchListener.clone(), self.radish26);
        cc.eventManager.addListener(touchListener.clone(), self.radish27);
        cc.eventManager.addListener(touchListener.clone(), self.radish28);
        cc.eventManager.addListener(touchListener.clone(), self.radish29);
        cc.eventManager.addListener(touchListener.clone(), self.radish31);
        cc.eventManager.addListener(touchListener.clone(), self.radish32);
        cc.eventManager.addListener(touchListener.clone(), self.radish33);
        cc.eventManager.addListener(touchListener.clone(), self.radish34);
        cc.eventManager.addListener(touchListener.clone(), self.radish35);
        cc.eventManager.addListener(touchListener.clone(), self.radish36);
        cc.eventManager.addListener(touchListener.clone(), self.radish37);
        cc.eventManager.addListener(touchListener.clone(), self.radish38);
        cc.eventManager.addListener(touchListener.clone(), self.radish39);
        cc.eventManager.addListener(touchListener.clone(), self.redPacket11);
        cc.eventManager.addListener(touchListener.clone(), self.redPacket12);
        cc.eventManager.addListener(touchListener.clone(), self.redPacket13);
        cc.eventManager.addListener(touchListener.clone(), self.redPacket14);
        cc.eventManager.addListener(touchListener.clone(), self.redPacket15);
        cc.eventManager.addListener(touchListener.clone(), self.redPacket16);
        cc.eventManager.addListener(touchListener.clone(), self.redPacket17);
        cc.eventManager.addListener(touchListener.clone(), self.redPacket18);
        cc.eventManager.addListener(touchListener.clone(), self.redPacket19);
        cc.eventManager.addListener(touchListener.clone(), self.redPacket21);
        cc.eventManager.addListener(touchListener.clone(), self.redPacket22);
        cc.eventManager.addListener(touchListener.clone(), self.redPacket23);
        cc.eventManager.addListener(touchListener.clone(), self.redPacket24);
        cc.eventManager.addListener(touchListener.clone(), self.redPacket25);
        cc.eventManager.addListener(touchListener.clone(), self.redPacket26);
        cc.eventManager.addListener(touchListener.clone(), self.redPacket27);
        cc.eventManager.addListener(touchListener.clone(), self.redPacket28);
        cc.eventManager.addListener(touchListener.clone(), self.redPacket29);
        cc.eventManager.addListener(touchListener.clone(), self.redPacket31);
        cc.eventManager.addListener(touchListener.clone(), self.redPacket32);
        cc.eventManager.addListener(touchListener.clone(), self.redPacket33);
        cc.eventManager.addListener(touchListener.clone(), self.redPacket34);
        cc.eventManager.addListener(touchListener.clone(), self.redPacket35);
        cc.eventManager.addListener(touchListener.clone(), self.redPacket36);
        cc.eventManager.addListener(touchListener.clone(), self.redPacket37);
        cc.eventManager.addListener(touchListener.clone(), self.redPacket38);
        cc.eventManager.addListener(touchListener.clone(), self.redPacket39);
        cc.eventManager.addListener(touchListener.clone(), self.marmot1);
        cc.eventManager.addListener(touchListener.clone(), self.marmot2);
        cc.eventManager.addListener(touchListener.clone(), self.marmot3);
        cc.eventManager.addListener(touchListener.clone(), self.marmot4);
        cc.eventManager.addListener(touchListener.clone(), self.marmot5);
        cc.eventManager.addListener(touchListener.clone(), self.marmot6);
        cc.eventManager.addListener(touchListener.clone(), self.marmot7);
        cc.eventManager.addListener(touchListener.clone(), self.marmot8);
        cc.eventManager.addListener(touchListener.clone(), self.marmot9);


          
        },

        gameBegin: function(){

          var self = this;

          self.holesArr = ['hole1','hole2','hole3','hole4','hole5','hole6','hole7','hole8','hole9'];

            self.statusArr = [];

            var SIMULATION_NUM = 1000;

            for(var i = 0; i < SIMULATION_NUM; i++){
              if(i < (self.GameConfig.RADISH_RATE / 3) * SIMULATION_NUM){
                self.statusArr[i] = 'radish1';
              }
              else if(i < (2 * self.GameConfig.RADISH_RATE / 3) * SIMULATION_NUM){
                self.statusArr[i] = 'radish2';
              }
              else if( i < self.GameConfig.RADISH_RATE * SIMULATION_NUM){
                self.statusArr[i] = 'radish3';
              }
              else if(i < ((self.GameConfig.RADISH_RATE + self.GameConfig.RED_PACKET_RATE) / 3) * SIMULATION_NUM){
                self.statusArr[i] = 'redPacket1';
              }
              else if(i < (2 * (self.GameConfig.RADISH_RATE + self.GameConfig.RED_PACKET_RATE) / 3) * SIMULATION_NUM){
                self.statusArr[i] = 'redPacket2';
              }
              else if(i < (self.GameConfig.RADISH_RATE + self.GameConfig.RED_PACKET_RATE) * SIMULATION_NUM){
                self.statusArr[i] = 'redPacket3';
              }
              else if(i < (self.GameConfig.RADISH_RATE + self.GameConfig.RED_PACKET_RATE + self.GameConfig.MARMOT_RATE) * SIMULATION_NUM){
                self.statusArr[i] = 'marmot'
              }
              else if(i < SIMULATION_NUM){
                self.statusArr[i] = 'blank';
              }
            }

            //将萝卜、红包、土拨鼠和空白出现的顺序打乱
            self.statusArr.sort(function(){return Math.random()>0.5?-1:1;}); 

             var readyTimoutTimer = setTimeout(function(){

                  self.ready.zIndex = -1;
                  self.go.zIndex = 100;

                  var goTimeoutTimer = setTimeout(function(){
                    self.go.zIndex = -1;

                    clearTimeout(readyTimoutTimer);
                    clearTimeout(goTimeoutTimer);

                    var j = 0;

                    //控制sprite分批显现和消失
                    self.intervalTimer = setInterval(function(){

                      if(isInit){
                        isInit = false;
                        self.schedule(self.update, 0.1);//0.1秒执行一次update
                      }

                      for(var i = 0; i < 9; i++){
                        self.controlAnim(self.statusArr[j * 9 + i], i);

                      }

                      j++;

                      if((j * 9 + i) > self.statusArr.length - 1){
                        j = 0;
                      }
                    }, self.GameConfig.STEP_TIME)

                  }, 500);

                },500);

        },

        controlAnim: function(spriteClassName, holeNo){
          var self = this;

          if(('blank' == spriteClassName)||(null == spriteClassName)||('' == spriteClassName)){
            return false;
          }

          var sprite = self.spriteArr[spriteClassName][holeNo],
              hole = self.holesArr[holeNo];

          if(sprite.inAnimation || (true == holeStatusArr[hole])){
            return false;
          }

          sprite.x = self.GameConfig[hole].x;
          sprite.y = self.GameConfig[hole].y;
          sprite.zIndex = self.GameConfig[hole].zIndex;

          sprite.inAnimation = true;
          holeStatusArr[hole] = true;

          var actionUp = cc.jumpBy(1, cc.p(0, 0), 180, self.GameConfig.JUMP_UP_TIME);
          var action = cc.sequence(actionUp);

          sprite.runAction(action);

          var durationTime = 1000 * self.GameConfig.JUMP_UP_TIME;//单位毫秒ms

          setTimeout(function(){
                sprite.inAnimation = false;
                holeStatusArr[hole] = false; 
          },durationTime);

          
        },

         //sprite显现和消失的动画
        spriteJumpDisappear: function(sprite){

            // cc.director.getScheduler().pauseTarget(sprite);

            sprite.inAnimation = true;

            var moveLength = 1500;//消失过程中移动的距离

            var n = 0;
            var disappearInterval = setInterval(function(){
                sprite.y += moveLength / 15;

                n++;

                if(n >= 15){

                  clearInterval(disappearInterval);
                  sprite.inAnimation = false;
                }
            },20)
            

        },

        update: function(){
          var self = this;

          timeCount++;

          self.timeBar.setScaleX(timeCount / totalTimeCount);

          self.beetle.x = 600 * (1 - (timeCount / totalTimeCount));

          // console.log(count);

          if(timeCount >= totalTimeCount){
            console.log('time up');

            clearInterval(self.intervalTimer);

            var layer = new cc.LayerColor(cc.color(0, 0, 0, 128));
            layer.setContentSize(self.size.width, self.size.height);
            layer.x = 0;
            layer.y = 0;

            self.addChild(layer, 110);

            self.popUpRadish.zIndex = 200;

            self.unscheduleAllCallbacks();

          }


        }




      });



		  cc.director.runScene(new MyScene());
	}, this);
};
cc.game.run("gameCanvas");	