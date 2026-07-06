"use client";

import type { IepExportData } from "@/lib/iep-export/types";
import {
  buildAssessmentTableRows,
  buildBasicInfoRows,
  buildGoalTableRows,
  buildIepSubtitle,
  buildIepTeachingSuggestions,
  IEP_DOC_TITLE,
  IEP_SIGNATURE_LINES,
} from "@/lib/iep-export/document-content";
import "./iep-export-document.css";

type IepExportDocumentProps = {
  data: IepExportData;
};

export function IepExportDocument({ data }: IepExportDocumentProps) {
  const basicInfoRows = buildBasicInfoRows(data);
  const assessmentRows = buildAssessmentTableRows(data);
  const goalRows = buildGoalTableRows(data);
  const teachingSuggestions = buildIepTeachingSuggestions(data);

  return (
    <div className="iep-export-document pdf-export-mode">
      <h1 className="iep-export-document__title">{IEP_DOC_TITLE}</h1>
      <p className="iep-export-document__subtitle">{buildIepSubtitle(data)}</p>

      <section data-pdf-keep-together className="iep-export-document__section-block">
        <h2 className="iep-export-document__section">一、基本信息</h2>
        <table className="iep-export-document__table iep-export-document__table--basic">
          <tbody>
            {basicInfoRows.map((row, index) => (
              <tr key={index}>
                <td className="iep-export-document__label">{row[0]}</td>
                <td className="iep-export-document__value">{row[1]}</td>
                <td className="iep-export-document__label">{row[2]}</td>
                <td className="iep-export-document__value">{row[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="iep-export-document__spacer" />

      <section className="iep-export-document__section-block">
        <h2 className="iep-export-document__section" data-pdf-keep-with-next>
          二、发展现状评估
        </h2>
        <table className="iep-export-document__table iep-export-document__table--assessment">
          <thead>
            <tr>
              <th className="iep-export-document__col-assess-domain">评估领域</th>
              <th className="iep-export-document__col-assess-level">等级</th>
              <th className="iep-export-document__col-assess-label">等级说明</th>
              <th className="iep-export-document__col-assess-desc">具体描述</th>
            </tr>
          </thead>
          <tbody>
            {assessmentRows.map((row, index) => (
              <tr key={index}>
                <td>{row.domain}</td>
                <td>{row.level}</td>
                <td>{row.levelLabel}</td>
                <td>{row.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="iep-export-document__spacer" />

      <section className="iep-export-document__section-block">
        <h2 className="iep-export-document__section" data-pdf-keep-with-next>
          三、长短期目标
        </h2>
        <table className="iep-export-document__table iep-export-document__table--goals">
          <thead>
            <tr>
              <th className="iep-export-document__col-domain">领域</th>
              <th className="iep-export-document__col-long-goal">长期目标</th>
              <th className="iep-export-document__col-short-goal">短期目标</th>
              <th className="iep-export-document__col-method">评量方式</th>
              <th className="iep-export-document__col-date">起止日期</th>
              <th className="iep-export-document__col-progress">进度</th>
            </tr>
          </thead>
          <tbody>
            {goalRows.map((row, index) => (
              <tr key={index}>
                <td>{row.domain}</td>
                <td>{row.longTermGoal}</td>
                <td>{row.shortTermGoal}</td>
                <td>{row.assessmentMethod}</td>
                <td>{row.dateRange}</td>
                <td>{row.progress}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="iep-export-document__spacer" />

      <section
        data-pdf-keep-together
        className="iep-export-document__section-block"
      >
        <h2 className="iep-export-document__section">四、教学决定建议</h2>
        <ul className="iep-export-document__list">
          {teachingSuggestions.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </section>

      <div className="iep-export-document__spacer" />

      <section
        data-pdf-keep-together
        className="iep-export-document__section-block"
      >
        <h2 className="iep-export-document__section">五、签名区</h2>
        {IEP_SIGNATURE_LINES.map((line) => (
          <p key={line} className="iep-export-document__signature">
            {line}
          </p>
        ))}
      </section>
    </div>
  );
}
