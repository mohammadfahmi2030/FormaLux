!macro customInstall
  DetailPrint "Registering FormaLux context menu..."
  WriteRegStr HKCR "*\shell\FormaLux" "" "تحويل بواسطة FormaLux"
  WriteRegStr HKCR "*\shell\FormaLux" "Icon" "$INSTDIR\FormaLux.exe"
  WriteRegStr HKCR "*\shell\FormaLux\command" "" '"$INSTDIR\FormaLux.exe" "%1"'
!macroend

!macro customUnInstall
  DeleteRegKey HKCR "*\shell\FormaLux"
!macroend
