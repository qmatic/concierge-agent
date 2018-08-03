import { Pipe, PipeTransform } from '@angular/core';
import { ICalendarBranchViewModel } from 'src/models/ICalendarBranchViewModel';

@Pipe({
  name: 'filterBranch'
})
export class FilterBranchPipe implements PipeTransform {

  transform(branches: ICalendarBranchViewModel[], filterText?: any): any {

    if(!branches || !filterText) {
      return branches;
    }

    return branches.filter(b => b.name.toUpperCase().search(filterText.toUpperCase()) != -1);
  }
}