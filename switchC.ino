int inputPin = 2;
int outputPin = 13;
int outputState = HIGH;
int previousState = LOW;
int pushed;
void setup() {
  // put your setup code here, to run once:
  pinMode(inputPin, INPUT);
  pinMode(outputPin, OUTPUT);
}

void loop() {
  pushed = digitalRead(inPin);
  if(pushed == HIGH && previousState == LOW){
    //checks if switch is pushed
    if(outputState == HIGH){
      //if centrifuge is on, turn off
      outputState = LOW;
    }
    else{
      //otherwise, the centrifuge turns on
      outputState = HIGH;
    }
  }
  digitalWrite(outputPin, outputState);
  //set the outpin pin to on or off depending on the output state
  previousState = pushed;
  //previous state is necessary to prevent errors from holding down the button.
}
