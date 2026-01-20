
import { Component, ChangeDetectionStrategy, output } from '@angular/core';

@Component({
  selector: 'app-code-editor',
  templateUrl: './code-editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodeEditorComponent {
  codeChange = output<string>();

  onCodeChange(event: Event): void {
    const code = (event.target as HTMLTextAreaElement).value;
    this.codeChange.emit(code);
  }
}
