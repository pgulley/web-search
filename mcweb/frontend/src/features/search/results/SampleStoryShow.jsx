import React from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { PROVIDER_NEWS_WAYBACK_MACHINE } from '../util/platforms';
import { googleFaviconUrl } from '../../ui/uiUtil';
import InfoMenu from '../../ui/InfoMenu';

export default function SampleStoryShow({
  data, lSTP, platform, handleClick, open, handleClose, anchorEl,
}) {
  const getStoryId = (url) => {
    if (!url) return null;
    const parts = url.split('/');
    return parts[(parts.length - 1)];
  };
  return (

    <table>
      <tbody>
        <tr>
          <th>Title</th>
          <th>Source</th>
          <th>Publication Date</th>
        </tr>
        {data.map((sampleStory) => (
          <tr key={`story-${sampleStory.id}`}>

            <td>
              <a href={sampleStory.url} target="_blank" rel="noreferrer">{sampleStory.title}</a>
            </td>

            <td>
              <img
                className="google-icon"
                src={googleFaviconUrl(sampleStory.media_url)}
                alt="{sampleStory.media_name}"
              />
              <a href={sampleStory.media_url} target="_blank" rel="noreferrer">{sampleStory.media_name}</a>
            </td>

            <td>{dayjs(sampleStory.publish_date).format('MM-DD-YY')}</td>

            {([PROVIDER_NEWS_WAYBACK_MACHINE].includes(platform)
              && lSTP === PROVIDER_NEWS_WAYBACK_MACHINE) && (
                <InfoMenu platform={platform} sampleStory={sampleStory} />
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

SampleStoryShow.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    archived_url: PropTypes.string,
    article_url: PropTypes.string,
    id: PropTypes.string,
    language: PropTypes.string,
    media_name: PropTypes.string,
    media_url: PropTypes.string,
    publish_date: PropTypes.string,
    title: PropTypes.string,
    url: PropTypes.string,
  })).isRequired,
  lSTP: PropTypes.string.isRequired,
  platform: PropTypes.string.isRequired,
  handleClick: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  anchorEl: PropTypes.element,
};

SampleStoryShow.defaultProps = {
  anchorEl: undefined,
};
