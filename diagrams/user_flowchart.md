# KanduTap Water Dispensing System - User Flow Diagram

```plantuml
@startuml
skinparam backgroundColor white
skinparam handwritten false
skinparam defaultFontName Arial
skinparam defaultFontSize 12
skinparam roundCorner 15
skinparam arrowColor #666666

skinparam activity {
  BackgroundColor #1a73e8
  BorderColor #4285f4
  FontColor white
  ArrowColor #666666
}

skinparam activityDiamond {
  BackgroundColor #f1c232
  BorderColor #f1c232
  FontColor black
}

title KanduTap Water Dispensing System - User Flow

start

:User approaches the water dispensing system;

:Place RFID card on the reader;

if (Is card registered?) then (no)
  :Display "Unregistered Card" message;
  :Prompt to register new user;
  
  if (User wants to register?) then (yes)
    :Collect user information;
    :Create new user account;
    :Link card to user account;
    :Set initial balance to zero;
    :Display registration confirmation;
  else (no)
    :End session;
    stop
  endif
  
else (yes)
  :Verify card authentication;
  
  if (Authentication successful?) then (no)
    :Display authentication error;
    :Prompt to try again or contact admin;
    stop
  else (yes)
    :Show main menu options;
    
    partition "Main Menu" {
      repeat
        :Display options:
        1. Check Balance
        2. Add Top-up
        3. Dispense Water
        4. View History
        5. Update Profile
        6. Exit;
        
        :User selects an option;
        
        switch (Selected option)
          case (Check Balance)
            :Display current card balance;
          case (Add Top-up)
            :Show top-up options;
            :User enters top-up amount;
            :Process payment;
            if (Payment successful?) then (yes)
              :Update card balance;
              :Generate receipt;
              :Display confirmation;
            else (no)
              :Display payment error;
              :Return to main menu;
            endif
          case (Dispense Water)
            :Check card balance;
            if (Sufficient balance?) then (yes)
              :Display water dispensing options;
              :User selects volume;
              :Calculate cost;
              :Deduct amount from balance;
              :Activate water pump;
              :Dispense selected volume;
              :Update transaction history;
              :Display remaining balance;
            else (no)
              :Display insufficient balance message;
              :Prompt to add top-up;
            endif
          case (View History)
            :Display sub-menu:
            1. Top-up History
            2. Dispensing History
            3. Back to Main Menu;
            
            :User selects history type;
            :Display selected transaction history;
          case (Update Profile)
            :Show current profile information;
            :User updates information;
            :Save changes;
            :Display confirmation;
          case (Exit)
            :End session;
        endswitch
      repeat while (User wants to perform another action?) is (yes)
    }
  endif
endif

:Thank user for using KanduTap;
:Display goodbye message;

stop

@enduml
```

## Diagram Description

This flowchart illustrates the complete user journey through the KanduTap Water Dispensing System, from initial card authentication to performing various actions within the system.

### Key User Flows:
1. **Card Authentication**: Verifies if the card is registered and authenticated
2. **New User Registration**: Process for registering new users and linking cards
3. **Main Menu Navigation**: Shows the different options available to users
4. **Balance Check**: Simple flow to view current card balance
5. **Top-up Process**: Steps for adding credit to the card
6. **Water Dispensing**: Process for selecting and dispensing water
7. **History Viewing**: Options to view transaction history
8. **Profile Management**: Flow for updating user information

The diagram includes decision points for handling various scenarios such as authentication failures, insufficient balance, and payment processing errors.
